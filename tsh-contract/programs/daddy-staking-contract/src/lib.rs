use anchor_lang::prelude::*;
use anchor_spl::token::{self,Transfer};
use std::mem::size_of;

pub mod account;
pub mod error;
pub mod constants;
pub mod utils;

use account::*;
use constants::*;
use error::*;


declare_id!("CZDNp3c2VPHXmcpd9GpU8dBaTFQayLSgdcefLyd8JfbK"); 

#[program]
pub mod daddy_staking {
    use super::*;

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
        let user_pool = &mut ctx.accounts.user_pool;
        let global_authority = &mut ctx.accounts.global_authority;
        let m_data = &mut ctx.accounts.metadata.try_borrow_data()?;
        let metadata = mpl_token_metadata::state::Metadata::deserialize(&mut &m_data[..])?;
        let source_account = &ctx.accounts.source_nft_account;
        let metadata_id = &ctx.accounts.metadata_id;
        let a_edition = &ctx.accounts.edition; 
        let nft_mint = &ctx.accounts.nft_mint;
        let a_token_program = &ctx.accounts.token_program;

        let collection_not_proper = metadata
        .data
        .creators
        .as_ref()
        .unwrap()
        .iter()
        .filter(|item|{
            COLLECTION_KEY == item.address && item.verified
        })
        .count() == 0;

        require!(!collection_not_proper && metadata.mint == ctx.accounts.nft_mint.key(), CustomError::InvalidNft);

        let timestamp = Clock::get()?.unix_timestamp;

        let cpi_ctx = CpiContext::new(
            a_token_program.to_account_info(),
            token::Approve{
                to: source_account.to_account_info(),
                delegate: user_pool.to_account_info(),
                authority: ctx.accounts.owner.to_account_info()
            }
        );
        token::approve(cpi_ctx, 1); 

        let instruction = mpl_token_metadata::instruction::freeze_delegated_account(
            metadata_id.to_account_info().key(), user_pool.to_account_info().key(), source_account.to_account_info().key(), a_edition.to_account_info().key(), nft_mint.to_account_info().key()
        );
        
        let (_pool, pool_bump) =
        Pubkey::find_program_address(&[
            USER_POOL_SEED.as_ref(), 
            user_pool.owner.as_ref()
        ], ctx.program_id);
        
        let seeds = &[USER_POOL_SEED.as_ref(), user_pool.owner.as_ref(),  &[pool_bump]];
        let signer = &[&seeds[..]];

        anchor_lang::solana_program::program::invoke_signed(&instruction, &[ 
            metadata_id.to_account_info().clone(),
            user_pool.to_account_info().clone(), 
            source_account.to_account_info().clone(), 
            a_edition.to_account_info().clone(),
            nft_mint.to_account_info().clone() 
        ], signer)?;
        
        global_authority.staked_count += 1;
        user_pool.calc_reward(timestamp);
        user_pool.owner = a_user.to_account_info().key();
        user_pool.staked_count += 1;

        Ok(())
    }

    #[access_control(user(&ctx.accounts.user_pool, &ctx.accounts.owner))]
    pub fn unstake_nft(
        ctx: Context<UnstakeNft>
    ) -> Result<()> {
        let user_pool = &mut ctx.accounts.user_pool;
        let timestamp = Clock::get()?.unix_timestamp;
        user_pool.calc_reward(timestamp);
        let a_edition = &ctx.accounts.edition; 
        let nft_mint = &ctx.accounts.nft_mint;
        let source_account = &ctx.accounts.source_nft_account;
        let metadata_id = &ctx.accounts.metadata_id;
        let global_authority = &mut ctx.accounts.global_authority;
        let a_token_program = &ctx.accounts.token_program;

        let timestamp = Clock::get()?.unix_timestamp;
        user_pool.calc_reward(timestamp);

        let (_pool, pool_bump) =
        Pubkey::find_program_address(&[
            USER_POOL_SEED.as_ref(), 
            user_pool.owner.as_ref()
        ], ctx.program_id);

        let seeds = &[USER_POOL_SEED.as_ref(), user_pool.owner.as_ref(),  &[pool_bump]];
        let signer = &[&seeds[..]];

        let instuction = mpl_token_metadata::instruction::thaw_delegated_account(
            metadata_id.to_account_info().key(),
            user_pool.to_account_info().key(),
            source_account.to_account_info().key(),
            a_edition.to_account_info().key(),
            nft_mint.to_account_info().key(),
        );
       
        anchor_lang::solana_program::program::invoke_signed(&instuction, &[ 
            metadata_id.to_account_info().clone(),
            user_pool.to_account_info().clone(), 
            source_account.to_account_info().clone(), 
            a_edition.to_account_info().clone(),
            nft_mint.to_account_info().clone() 
        ], signer)?;

        let cpi_ctx = CpiContext::new(
            a_token_program.to_account_info(),
            token::Revoke{
                source: source_account.to_account_info(),
                authority: ctx.accounts.owner.to_account_info()
            }
        );
        token::revoke(cpi_ctx)?;

        global_authority.staked_count -= 1;
        user_pool.staked_count -= 1;

        Ok(())
    }

    #[access_control(user(&ctx.accounts.user_pool, &ctx.accounts.owner))]
    pub fn claim_reward(
        ctx: Context<ClaimReward>
    ) -> Result<()> {
        let global_authority = &mut ctx.accounts.global_authority;
        let user_pool = &mut ctx.accounts.user_pool;
        let a_reward_from = &ctx.accounts.source_account;
        let a_reward_to = &ctx.accounts.dest_account;
        let a_token_program = &ctx.accounts.token_program;

        let timestamp = Clock::get()?.unix_timestamp;

        let reward_amount = user_pool.calc_reward(timestamp).unwrap();
        
        msg!("reward amount {}",reward_amount);
        let (_vault, vault_bump) =
            Pubkey::find_program_address(&[
                GLOBAL_AUTHORITY_SEED.as_ref()
        ], ctx.program_id);

        // let vault_seeds = &[
        //     GLOBAL_AUTHORITY_SEED.as_bytes().as_ref(),
        //     &[vault_bump],
        // ];

        // let vault_signer = &[&vault_seeds[..]];

        // let cpi_ctx = CpiContext::new_with_signer (
        //     a_token_program.to_account_info(),
        //     token::Transfer {
        //         from: a_reward_from.to_account_info(),
        //         to: a_reward_to.to_account_info(),
        //         authority: global_authority.to_account_info()
        //     },
        //     vault_signer
        // );
        
        // token::transfer(cpi_ctx, reward_amount)?;

        global_authority.total_reward += reward_amount;
        user_pool.earned_reward += reward_amount;
        // user_pool.total_reward = 0;

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

    #[account(mut, constraint = owner.key() == ADMIN_KEY)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitUserPool<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init_if_needed,
        seeds = [USER_POOL_SEED.as_ref(), owner.key().as_ref()],
        bump,
        payer = owner,
        space=size_of::<UserPool>() + 8,
    )]
    pub user_pool: Account<'info, UserPool>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    //pub rand : AccountInfo<'info>, 

    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct StakeNft<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut, constraint = user_pool.owner == owner.key())]
    pub user_pool: Account<'info, UserPool>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
    )]
    pub global_authority: Account<'info, GlobalPool>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut,owner=spl_token::id())]
    nft_mint : AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut,owner=spl_token::id())]
    source_nft_account : AccountInfo<'info>,

    /// CHECK: it's not dangerous
    pub metadata: AccountInfo<'info>, 

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub edition: AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub metadata_id: AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    // pub rent: Sysvar<'info, Rent>
}


#[derive(Accounts)]
pub struct UnstakeNft<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut, constraint = user_pool.owner == owner.key())]
    pub user_pool: Account<'info, UserPool>,

    #[account(mut)]
    pub global_authority: Account<'info, GlobalPool>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut,owner=spl_token::id())]
    nft_mint : AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut,owner=spl_token::id())]
    source_nft_account : AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub edition: AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub metadata_id: AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: AccountInfo<'info>,
}


#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut, constraint = user_pool.owner == owner.key())]
    pub user_pool: Account<'info, UserPool>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
    )]
    pub global_authority: Account<'info, GlobalPool>,

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

#[error_code]
pub enum CustomError {
    #[msg("Invalid Nft.")]
    InvalidNft,
    #[msg("Transfer too much.")]
    TooMuchTransfer,
    #[msg("Can't divide zero")]
    InvalidByDivideZero,
}
