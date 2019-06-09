# nodejs-bot

Telegram bot to compile js code in nodejs runtime.
Sends standard output or error streams as result. The bot has a limit on the execution time of the script and protection from interferences with the file system and processes (through the fs and child_process libraries). It has user and group settings, such as setting a limit on the number of lines and characters in one message, the ability to temporarily turn off the bot in the group. It also has a built-in task queue with a limited number of scripts per user.

# How does it work?

To implement the bot, the node-telegram-bot-api library was used. The bot instance is subscribed to the "text" event. The received message is sent to the inQueue [handler](https://github.com/PaIIadium/nodejs-bot/blob/master/handler.js) method. Depending on the commands, different functions are executed from the [commands.js](https://github.com/PaIIadium/nodejs-bot/blob/master/commands.js) file.

# Where are the bot settings stored?

To store user and group settings, [user_settings.csv](https://github.com/PaIIadium/nodejs-bot/blob/master/data/user_settings.csv) and [group_settings.csv](https://github.com/PaIIadium/nodejs-bot/blob/master/data/group_settings.csv) files are used. When the bot starts, these files are parsed and the settings are written to the Map dictionaries ([collections.js](https://github.com/PaIIadium/nodejs-bot/blob/master/collections.js)). When editing settings, the Map changes, and before shutting down the bot, use the **/update** command to overwrite the corresponding files.

# How security of code execution is achieved?
To eliminate the possibility of user interaction with the file system and server-side processes, a separate process running from another user is used to execute the code:

`echo ${code} | su nodeuser -c 'timeout ${timeout}s node'`

This user (nodeuser) has no rights to intervene in the server system. 

# Available commands
## GENERAL

**/node** - compiles the code entered after this command.

**/start** - gives instructions on how to use the bot.

**/status** - displays the current settings of the bot.

**/maxchars** - changes the maximum number of characters in a single output message (if in a group, available only to admins).

**/maxlines** - changes the maximum number of lines in one output message (if in a group, available only to admins).

## GROUP (for group admins only)

**/enable** - enables bot in group.

**/disable** - disables the bot in the group.

## GLOBAL (for bot creators only)

**/globaldisable** - disables the bot for all chats.

**/globalenable** - enables a bot for all chats.

**/timeout** - sets the maximum runtime of the script.

**/maxtasksperuser** - sets the maximum number of scripts from one user in the queue.

**/update** - updates the group and user settings files.
