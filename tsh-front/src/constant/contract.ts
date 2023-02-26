//export const COLLECTION_NAME = "ZK";
//export const COLLECTION_SYMBOL = "ZK";
export const COLLECTION_ADDRESS = "FN4Yn1YSoWyyWNyzdxu5T3iQDBZeu1rxaQwXY1tomBwA";
//export const COLLECTION_ADDRESS = "2TxZJdpWUDttKjwryJatNVm8Xk1diEuyQgQ7NTxZkKth";

export const STAKE_STATUS = {
  UNSTAKED: 0,
  STAKED: 1,
};
export const STAKE_DATA_SIZE = 432

export type DaddyStaking = {
  "version": "0.1.0",
  "name": "daddy_staking",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initUserPool",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "stakeNft",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sourceNftAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "metadata",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "edition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataId",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "unstakeNft",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sourceNftAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "edition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataId",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "claimReward",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sourceAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "globalPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stakedCount",
            "type": "u32"
          },
          {
            "name": "totalReward",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "userPoolData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "nftMint",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "userPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "stakedCount",
            "type": "u32"
          },
          {
            "name": "totalReward",
            "type": "u64"
          },
          {
            "name": "earnedReward",
            "type": "u64"
          },
          {
            "name": "rewardTime",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "CustomError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InvalidNft"
          },
          {
            "name": "TooMuchTransfer"
          },
          {
            "name": "InvalidByDivideZero"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidUserPool",
      "msg": "Invalid User Pool"
    },
    {
      "code": 6001,
      "name": "InvalidPoolError",
      "msg": "Invalid pool number"
    },
    {
      "code": 6002,
      "name": "InvalidNFTAddress",
      "msg": "No Matching NFT to withdraw"
    },
    {
      "code": 6003,
      "name": "InvalidOwner",
      "msg": "NFT Owner key mismatch"
    },
    {
      "code": 6004,
      "name": "InvalidWithdrawTime",
      "msg": "Staking Locked Now"
    },
    {
      "code": 6005,
      "name": "IndexOverflow",
      "msg": "Withdraw NFT Index OverFlow"
    },
    {
      "code": 6006,
      "name": "LackLamports",
      "msg": "Insufficient Lamports"
    },
    {
      "code": 6007,
      "name": "InvalidRewardAmount",
      "msg": "Invalid reward amount"
    }
  ]
};

export const DADDYSTAKING_IDL: DaddyStaking = {
  "version": "0.1.0",
  "name": "daddy_staking",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initUserPool",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "stakeNft",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sourceNftAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "metadata",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "edition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataId",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "unstakeNft",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sourceNftAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "edition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataId",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "claimReward",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sourceAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "globalPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stakedCount",
            "type": "u32"
          },
          {
            "name": "totalReward",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "userPoolData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "nftMint",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "userPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "stakedCount",
            "type": "u32"
          },
          {
            "name": "totalReward",
            "type": "u64"
          },
          {
            "name": "earnedReward",
            "type": "u64"
          },
          {
            "name": "rewardTime",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "CustomError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InvalidNft"
          },
          {
            "name": "TooMuchTransfer"
          },
          {
            "name": "InvalidByDivideZero"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidUserPool",
      "msg": "Invalid User Pool"
    },
    {
      "code": 6001,
      "name": "InvalidPoolError",
      "msg": "Invalid pool number"
    },
    {
      "code": 6002,
      "name": "InvalidNFTAddress",
      "msg": "No Matching NFT to withdraw"
    },
    {
      "code": 6003,
      "name": "InvalidOwner",
      "msg": "NFT Owner key mismatch"
    },
    {
      "code": 6004,
      "name": "InvalidWithdrawTime",
      "msg": "Staking Locked Now"
    },
    {
      "code": 6005,
      "name": "IndexOverflow",
      "msg": "Withdraw NFT Index OverFlow"
    },
    {
      "code": 6006,
      "name": "LackLamports",
      "msg": "Insufficient Lamports"
    },
    {
      "code": 6007,
      "name": "InvalidRewardAmount",
      "msg": "Invalid reward amount"
    }
  ]
};

