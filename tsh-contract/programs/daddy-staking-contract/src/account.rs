use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
pub struct GlobalPool {
    pub staked_count: u32,
    pub total_reward: u64
}

#[account]
pub struct UserPoolData {
    pub owner: Pubkey,
    pub nft_mint: Pubkey,
}

#[account]
pub struct UserPool {
    pub owner: Pubkey,
    pub staked_count: u32,
    pub total_reward: u64,
    pub earned_reward: u64,
    pub reward_time: i64,     
}

impl UserPool {
    pub fn calc_reward(&mut self, now: i64) -> Result<u64> {  
        let mut rest : u8 = (self.staked_count % 8) as u8;
        let mut prize : u8 = (self.staked_count / 8) as u8;

        let mut daily_reward = 0;

        daily_reward =  (2 * 8 * 24 * prize as u64) as u64 ;

        prize = (rest / 6) as u8;
        rest = rest % 6; 
        
        daily_reward = daily_reward + (1.75 * 6.0  * 24.0 * prize as f32) as u64;

        prize = (rest / 4) as u8;
        rest = rest % 4;
        
        daily_reward = daily_reward + (1.5 * 4.0 * 24.0 * prize as f32) as u64;

        daily_reward = daily_reward + (24 * rest) as u64;

        self.total_reward =  self.total_reward + daily_reward as u64 * ((now - self.reward_time) / DAY_TIME * DECIMAL) as u64;
        self.reward_time = now;
        Ok(self.total_reward)
    }
}


