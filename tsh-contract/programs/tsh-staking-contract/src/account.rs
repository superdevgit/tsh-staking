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
    fn get_daily_reward_multiplier(cnt : u8) -> Result<f64> {
        let mut res: f64 = 0.0;
        if cnt == 1 {
            res = 1 as f64;
        } else if cnt == 2 {
            res = 1.25;
        } else if cnt == 4 {
            res = 1.5;
        } else if cnt == 6 {
            res = 1.75;
        } else if cnt == 8 {
            res = 2 as f64;
        } 
        Ok(res)
    }

    pub fn calc_reward(&mut self, now: i64) -> Result<u64> {  
        let rest : u8 = (self.staked_count % 8) as u8;
        let daily_reward;
        if rest % 2 == 0{
            daily_reward = 8.0 * 2.0 * 2.0 * ( self.staked_count / 8 ) as f64 + rest as f64 * 2.0 * UserPool::get_daily_reward_multiplier(rest).unwrap();
        }
        else {
            daily_reward = 8.0 * 2.0 * 2.0 * ( self.staked_count / 8 ) as f64 + (rest - 1) as f64 * 2.0 * UserPool::get_daily_reward_multiplier(rest - 1).unwrap() + 1.0 * 2.0 * 1.0;
        }
        self.total_reward =  self.total_reward + daily_reward as u64 * ((now - self.reward_time) / DAY_TIME * DECIMAL) as u64;
        self.reward_time = now;
        Ok(self.total_reward)
    }
}

