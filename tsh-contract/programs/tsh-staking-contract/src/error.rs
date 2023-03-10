use anchor_lang::prelude::*;

#[error_code]
pub enum StakingError {
    #[msg("Invalid User Pool")]
    InvalidUserPool,
    #[msg("Invalid pool number")]
    InvalidPoolError,
    #[msg("No Matching NFT to withdraw")]
    InvalidNFTAddress,
    #[msg("NFT Owner key mismatch")]
    InvalidOwner,
    #[msg("Staking Locked Now")]
    InvalidWithdrawTime,
    #[msg("Withdraw NFT Index OverFlow")]
    IndexOverflow,
    #[msg("Insufficient Lamports")]
    LackLamports,
    #[msg("Invalid reward amount")]
    InvalidRewardAmount
}