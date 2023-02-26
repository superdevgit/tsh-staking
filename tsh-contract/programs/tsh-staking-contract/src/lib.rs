use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer};
use std::mem::size_of;

pub mod account;
pub mod error;
pub mod constants;
pub mod utils;

use account::*;
use constants::*;
use error::*;

declare_id!("AK5penqfSfF1BeKj2xE6xnjNNra8EbQ2bWqaTx566Waa"); 

#[program]
pub mod tsh_staking {
    use super::*;
    use anchor_lang::AccountsClose;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let global_authority = &mut ctx.accounts.global_authority;
        global_authority.staked_count = 0;
        global_authority.total_reward = 0;
        Ok(())
    }

    pub fn init_user_pool(ctx: Context<InitUserPool>) -> Result<()> {
        let user_pool = &mut ctx.accounts.user_pool;
        user_pool.owner = ctx.accounts.owner.key();
        user_pool.staked_count = 0;
        user_pool.total_reward = 0;
        user_pool.earned_reward = 0;
        user_pool.reward_time = 0;
        Ok(())
    }

    #[access_control(user(&ctx.accounts.user_pool, &ctx.accounts.owner))]
    pub fn stake_nft(
        ctx: Context<StakeNft> 
    ) -> Result<()> {

        let a_user = &ctx.accounts.owner;
        let a_statistic = &mut ctx.accounts.global_authority;
        let a_pool = &mut ctx.accounts.user_pool;
        let a_pool_data = &mut ctx.accounts.user_pool_data;
        let a_mint = &ctx.accounts.nft_mint;
        let a_token_from = &ctx.accounts.source_nft_account;
        let a_token_to = &ctx.accounts.dest_nft_account;
        let a_token_program = &ctx.accounts.token_program;

        let timestamp = Clock::get()?.unix_timestamp;

        let cpi_ctx = CpiContext::new(
            a_token_program.to_account_info(),
            token::Transfer {
                from: a_token_from.to_account_info(),
                to: a_token_to.to_account_info(),
                authority: a_user.to_account_info()
            }
        );
        token::transfer(cpi_ctx, 1)?;

        a_statistic.staked_count += 1;

        a_pool.calc_reward(timestamp);
        a_pool.owner = a_user.to_account_info().key();
        a_pool.staked_count += 1;

        a_pool_data.owner = a_user.to_account_info().key();
        a_pool_data.nft_mint = a_mint.to_account_info().key();

        Ok(())
    }

    #[access_control(user(&ctx.accounts.user_pool, &ctx.accounts.owner))]
    pub fn unstake_nft(
        ctx: Context<UnstakeNft>,
        global_bump: u8  
    ) -> Result<()> {
        let a_user = &ctx.accounts.owner;
        let a_vault = &mut ctx.accounts.global_authority;
        let a_pool = &mut ctx.accounts.user_pool;
        let a_pool_data = &mut ctx.accounts.user_pool_data;
        
        let timestamp = Clock::get()?.unix_timestamp;
        a_pool.calc_reward(timestamp);

        let seeds = &[GLOBAL_AUTHORITY_SEED.as_bytes(), &[global_bump]];
        let signer = &[&seeds[..]];
        let cpi_accounts = Transfer {
            from: ctx.accounts.source_nft_account.clone(),
            to: ctx.accounts.dest_nft_account.clone(),
            authority: a_vault.to_account_info()
        };
        let token_program = ctx.accounts.token_program.clone();
        let transfer_ctx = CpiContext::new_with_signer(token_program, cpi_accounts, signer);
        token::transfer(
            transfer_ctx,
            1
        )?;

        a_vault.staked_count -= 1;
        a_pool.staked_count -= 1;

        a_pool_data.close(a_user.to_account_info())?;    

        Ok(())
    }

    #[access_control(user(&ctx.accounts.user_pool, &ctx.accounts.owner))]
    pub fn claim_reward(
        ctx: Context<ClaimReward>
    ) -> Result<()> {

        let a_vault = &mut ctx.accounts.global_authority;
        let a_pool = &mut ctx.accounts.user_pool;
        let a_reward_from = &ctx.accounts.source_account;
        let a_reward_to = &ctx.accounts.dest_account;
        let a_token_program = &ctx.accounts.token_program;

        let timestamp = Clock::get()?.unix_timestamp;

        let reward_amount = a_pool.calc_reward(timestamp).unwrap();
        
        msg!("reward amount {}",reward_amount);
        let (_vault, vault_bump) =
            Pubkey::find_program_address(&[
                GLOBAL_AUTHORITY_SEED.as_ref(), 
        ], ctx.program_id);

        let vault_seeds = &[
            GLOBAL_AUTHORITY_SEED.as_bytes().as_ref(),
            &[vault_bump],
        ];

        let vault_signer = &[&vault_seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer (
            a_token_program.to_account_info(),
            token::Transfer {
                from: a_reward_from.to_account_info(),
                to: a_reward_to.to_account_info(),
                authority: a_vault.to_account_info()
            },
            vault_signer
        );

        token::transfer(cpi_ctx, reward_amount)?;

        a_vault.total_reward += reward_amount;
        a_pool.earned_reward += reward_amount;
        a_pool.total_reward = 0;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {

    #[account(
        init_if_needed,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
        payer = owner,
        space=size_of::<GlobalPool>() + 8,
    )]
    pub global_authority: Account<'info, GlobalPool>,  

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitUserPool<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init_if_needed,
        seeds = [USER_POOL_SEEDS.as_ref(), owner.key().as_ref()],
        bump,
        payer = owner,
        space=size_of::<UserPool>() + 8,
    )]
    pub user_pool: Account<'info, UserPool>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct StakeNft<'info> { 
    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
    )]
    pub global_authority: Account<'info, GlobalPool>,

    #[account(mut)]
    pub user_pool: Account<'info, UserPool>,
    
    #[account(init_if_needed, seeds = [USER_POOL_DATA_SEEDS.as_ref(), owner.key().as_ref(), nft_mint.key().as_ref()], bump, payer = owner, space = 8 + 32 + 32 + 1 + 4)]
    pub user_pool_data: Account<'info, UserPoolData>,

    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut,owner=spl_token::id())]
    nft_mint : AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut,owner=spl_token::id())]
    source_nft_account : AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut,owner=spl_token::id())]
    dest_nft_account : AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    // pub rent: Sysvar<'info, Rent>
}


#[derive(Accounts)]
pub struct UnstakeNft<'info> {
    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
    )]
    pub global_authority: Account<'info, GlobalPool>,

    #[account(mut)]
    pub user_pool: Account<'info, UserPool>,

    #[account(mut)]
    pub user_pool_data: Account<'info, UserPoolData>,

    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut,owner=spl_token::id())]
    nft_mint : AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut,owner=spl_token::id())]
    source_nft_account : AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut,owner=spl_token::id())]
    dest_nft_account : AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: AccountInfo<'info>,
}


#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
    )]
    pub global_authority: Account<'info, GlobalPool>,

    #[account(mut)]
    pub user_pool: Account<'info, UserPool>,

    // #[account(mut)]
    // pub user_pool_data: Account<'info, UserPoolData>,

    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    // #[account(mut,owner=spl_token::id())]
    // nft_mint : Account<'info, Mint>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut,owner=spl_token::id())]
    source_account : AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut,owner=spl_token::id())]
    dest_account : AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: AccountInfo<'info>,
}

// Access control modifiers
fn user(pool_loader: &Account<UserPool>, user: &AccountInfo) -> Result<()> {
    require!(pool_loader.owner == *user.key, StakingError::InvalidUserPool);
    Ok(())
}

