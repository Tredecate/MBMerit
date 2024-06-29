# MBMerit [Defunct]
Repository for the bot behind the MusicalBasics Discord Merit project

## Requirements
- At least NodeJS v16

## Installation
Clone this repository and run the following inside the cloned directory:  
`npm install`

## Running
After NPM has installed the necessary modules, run the following inside the cloned directory:  
`npm start`

## Config
This app will grab some configuration values from `config.json`, located in the base project directory.  
The format for this file should match the following (without the comments):  
```json
{
    "BOTS": {
        "BotName": {
            "name": "BotName",                          // Ideally the same as the parent value
            "ids": {
                "guild": "999999999999999999",          // The ID of the guild/server to base operations on
                "levelChannel": "999999999999999999",   // The channel to receive level updates from if using Mee6
                "meritChannel": "999999999999999999",   // The generic merit channel for sending voting polls
                "logChannel": "999999999999999999",     // The channel to send logs to via repl.log, primarily for testing
                "evalUsers": ["999999999999999999"]     // The users who should be allowed to run eval() commands (dangerous)
            }
        }
    }
}
```

## Discord Bot Token
If this is being ran in the correct VM on the Google Cloud Project, this will fetch and use the token for `Merit#7485`.  
If this is being ran on a local machine, this will look for a `tokens.json` file in the base project directory. This is intended for testing.

The format for this file should match the following:  
```json
{
    "BotName": "XXXXXXXXXXXXXXXXXX.XXXXX.XXXXXXXXXXXXXXXXXXXX-XXXXX"
}
```  
This file has been excluded from git commits for security reasons.
