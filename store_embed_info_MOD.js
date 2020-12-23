module.exports = {

	//---------------------------------------------------------------------
	// Action Name
	//
	// This is the name of the action displayed in the editor.
	//---------------------------------------------------------------------

	name: "Store Embed Info",

	//---------------------------------------------------------------------
	// Action Section
	//
	// This is the section the action will fall into.
	//---------------------------------------------------------------------

	section: "Embed Message",

	//---------------------------------------------------------------------
	// Action Subtitle
	//
	// This function generates the subtitle displayed next to the name.
	//---------------------------------------------------------------------

	subtitle: function (data) {
		return `${data.info || "Unknown"}`;
	},

	//---------------------------------------------------------------------
	// DBM Mods Manager Variables (Optional but nice to have!)
	//
	// These are variables that DBM Mods Manager uses to show information
	// about the mods for people to see in the list.
	//---------------------------------------------------------------------

	// Who made the mod (If not set, defaults to "DBM Mods")
	author: "CoolGuy",

	// The version of the mod (Defaults to 1.0.0)
	version: "1.0.0",

	// A short description to show on the mod line for this mod (Must be on a single line)
	short_description: "Gets Embed info.",

	// If it depends on any other mods by name, ex: WrexMODS if the mod uses something from WrexMods


	//---------------------------------------------------------------------

	//---------------------------------------------------------------------
	// Action Storage Function
	//
	// Stores the relevant variable info for the editor.
	//---------------------------------------------------------------------

	variableStorage: function (data, varType) {
		if (parseInt(data.storage) !== varType) return;
		
		let datatype;
		
		switch (data.info) {
			case "author":
			case "fields":
				datatype = "JSON";
				break;
			case "files":
				datatype = "File(s)";
				break;
			default:
				datatype = "String";
				break;
		}
		
		return ([data.varName2, datatype]);
	},

	//---------------------------------------------------------------------
	// Action Fields
	//
	// These are the fields for the action. These fields are customized
	// by creating elements with corresponding IDs in the HTML. These
	// are also the names of the fields stored in the action's JSON data.
	//---------------------------------------------------------------------

	fields: ["message", "varName", "info", "storage", "varName2"],

	//---------------------------------------------------------------------
	// Command HTML
	//
	// This function returns a string containing the HTML used for
	// editting actions.
	//
	// The "isEvent" parameter will be true if this action is being used
	// for an event. Due to their nature, events lack certain information,
	// so edit the HTML to reflect this.
	//
	// The "data" parameter stores constants for select elements to use.
	// Each is an array: index 0 for commands, index 1 for events.
	// The names are: sendTargets, members, roles, channels,
	//                messages, servers, variables
	//---------------------------------------------------------------------

	html: function (isEvent, data) {
		return `
<div>
	<div style="float: left; width: 35%;">
		Source Message:<br>
		<select id="message" class="round" onchange="glob.messageChange(this, 'varNameContainer')">
			${data.messages[1]}
		</select>
	</div>
	<div id="varNameContainer" style="display: none; float: right; width: 60%;">
		Variable Name:<br>
		<input id="varName" class="round" type="text" list="variableList"><br>
	</div>
</div><br><br><br>
<div>
	<div style="padding-top: 8px; width: 70%;">
		Source Info:<br>
		<select id="info" class="round">
			<option value="author">Embed Author Object</option>
			<option value="author name">Embed Author Name</option>
			<option value="author url">Embed Author URL</option>
			<option value="author icon url">Embed Author Icon URL</option>
			<option value="author proxy icon url">Embed Author Proxy Icon URL</option>
			<option value="color">Embed Color</option>
			<option value="hexColor">Embed Hex Color</option>
			<option value="description">Embed Description</option>
			<option value="fields">Embed Fields</option>
			<option value="image url">Embed Image URL</option>
			<option value="image proxy">Embed Image Proxy URL</option>
			<option value="thumbnail url">Embed Thumbnail URL</option>
			<option value="thumbnail proxy">Embed Thumbnail Proxy URL</option>
			<option value="timestamp">Embed Timestamp</option>
			<option value="createdAt">Embed Created At Timestamp</option>
			<option value="type">Embed Type</option>
			<option value="files">Embed Files</option>
			<option value="video">Embed Video</option>
			<option value="provider">Embed Provider</option>
		</select>
	</div>
</div><br>
<div>
	<div style="float: left; width: 35%;">
		Store In:<br>
		<select id="storage" class="round">
			${data.variables[1]}
		</select>
	</div>
	<div id="varNameContainer2" style="float: right; width: 60%;">
		Variable Name:<br>
		<input id="varName2" class="round" type="text"><br>
	</div>
</div>`
	},

	//---------------------------------------------------------------------
	// Action Editor Init Code
	//
	// When the HTML is first applied to the action editor, this code
	// is also run. This helps add modifications or setup reactionary
	// functions for the DOM elements.
	//---------------------------------------------------------------------

	init: function () {
		const { glob, document } = this;
		glob.messageChange(document.getElementById('message'), 'varNameContainer');
	},

	//---------------------------------------------------------------------
	// Action Bot Function
	//
	// This is the function for the action within the Bot's Action class.
	// Keep in mind event calls won't have access to the "msg" parameter,
	// so be sure to provide checks for variable existance.
	//---------------------------------------------------------------------

	action: function (cache) {
		const data = cache.actions[cache.index];
		const message = parseInt(data.message);
		const varName = this.evalMessage(data.varName, cache);
		const storage = parseInt(data.storage);
		const varName2 = this.evalMessage(data.varName2, cache);
		const msg = this.getMessage(message, varName, cache);
		
		if (!msg) throw new Error("No message found.");
		if (!msg.embeds || !msg.embeds[0]) throw new Error("Message is not an embed message.");
		
		let output;
		switch (data.info) {
			case "author name":
				output = (msg.embeds[0].author || {}).name;
				break;
			case "author url":
				output = (msg.embeds[0].author || {}).url;
				break;
			case "author icon url":
				output = (msg.embeds[0].author || {}).iconURL;
				break;
			case "author proxy icon url":
				output = (msg.embeds[0].author || {}).proxyIconURL;
				break;
			case "image url":
			case "thumbnail url":
				output = (msg.embeds[0][data.info] || {}).url
				break;
			case "image proxy":
			case "thumbnail proxy":
				output = (msg.embeds[0][data.info] || {}).proxyURL
				break;
			default:
				output = msg.embeds[0][data.info];
				break;
		}
		
		if (output !== undefined) this.storeValue(output, storage, varName2, cache);
		
		this.callNextAction(cache);
	},

	//---------------------------------------------------------------------
	// Action Bot Mod
	//
	// Upon initialization of the bot, this code is run. Using the bot's
	// DBM namespace, one can add/modify existing functions if necessary.
	// In order to reduce conflictions between mods, be sure to alias
	// functions you wish to overwrite.
	//---------------------------------------------------------------------

	mod: function (DBM) {}

}; // End of module