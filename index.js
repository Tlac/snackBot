require('dotenv').load();
const SlackBot = require('slackbots');


const bot = new SlackBot({
	token: process.env.BOT_TOKEN,
	name: 'snackbot'
});

let allUsers = []
let snackCart = {}
const channel = 'snackcart'
// Start Handler
bot.on('start', () => {
	bot.getUsers().then((currentUsers) => {
		allUsers = currentUsers.members
	});
	const params = {
	};
	bot.postMessageToChannel(channel, 'Who\'s hungry , type `help` if you learn the commands', params);
});


// Error Handler
bot.on('error', (err) => {
	const params = {
	};
	// message doesnt run after bot crashes
	bot.postMessageToChannel(channel, 'Oh oh! someone crashed the snack cart, now nobody gets to eat', params);
	console.log(err)
});

// Message Receiver
bot.on('message', (data) => {

	if(data.type !== 'message') {
		return;
	}

	userName = findUserById(data.user)

	if (userName !== undefined) {
		handleMessage(userName, data.text)
	}

});

// Message Handler
function handleMessage(userName, message) {
	message = message.toLowerCase()
	if (message.toLowerCase() === 'help') {
		bot.postMessageToChannel(channel,
		'looks like you need help, here are some commands \n `add [item]` e.g. `add fruit roll ups` \n `remove [item]` e.g. `remove fruit roll ups` \n `show cart` shows all the current items in the cart \n `empty cart` Warning: will empty the entire cart');
	}

	if (message.includes('add ')) {
		let item = message.substring(4);
		addItemToCart(userName, item);
		console.log(snackCart)
	}

	if (message.includes('remove ')) {
		let item = message.substring(7);
		removeItemFromCart(userName, item);
		console.log(snackCart)
	}

	if (message.includes('empty ')) {
		snackCart = {}
		bot.postMessageToChannel(channel, `${userName} has emptied the cart`);
	}

	if (message.includes('show ')) {
		console.log(snackCart)
		if(Object.keys(snackCart).length === 0 && snackCart.constructor === Object) {
			bot.postMessageToChannel(channel, `The cart is currently empty. Use \`add\` to add items to the cart :pizza:`);
		} else {
			displayCart()
		}
	}
}

function addItemToCart(userName, itemToAdd) {
	if (!snackCart.hasOwnProperty(userName)) {
		snackCart[userName] = [itemToAdd];
		bot.postMessageToChannel(channel, `${userName} has added ${itemToAdd} to the cart`);
	} else {
		if (snackCart[userName].includes(itemToAdd)) {
			bot.postMessageToChannel(channel, `${userName}, you already have ${itemToAdd} in your cart`);
		} else {
			snackCart[userName] = snackCart[userName].concat(itemToAdd)
			bot.postMessageToChannel(channel, `${userName} has added ${itemToAdd} to the cart`);
		}

	}
}

function removeItemFromCart(userName, itemToRemove) {
	if (snackCart.hasOwnProperty(userName)) {
		if (snackCart[userName].includes(itemToRemove)) {
			snackCart[userName] = snackCart[userName].filter((currentItem) => currentItem !== itemToRemove)
			bot.postMessageToChannel(channel, `${userName} has removed ${itemToRemove} from the cart`);
		} else {
			bot.postMessageToChannel(channel, `${userName}, you don't have ${itemToRemove} in your cart`);
		}
	} else {
		bot.postMessageToChannel(channel, `${userName}, you have nothing in your cart type \`add ${itemToRemove}\` to add it to your cart`);
	}
}

function displayCart() {
	let formattedList;
	Object.keys(snackCart).forEach(function(userName){
		if (snackCart[userName].length === 0) {
			bot.postMessageToChannel(channel, `${userName} is too good for snacks`);
		} else if (snackCart[userName].length === 1) {
			formattedList = snackCart[userName][0]
			bot.postMessageToChannel(channel, `${userName} wants ${formattedList}`);
		} else if (snackCart[userName].length === 2) {
			formattedList = snackCart[userName].join(' and ')
			bot.postMessageToChannel(channel, `${userName} wants ${formattedList}`);
		} else {
			let listLength = snackCart[userName].length
			formattedList = snackCart[userName].slice(0,listLength-1).join(', ') + ', and ' + snackCart[userName][listLength-1];
			bot.postMessageToChannel(channel, `${userName} wants ${formattedList}`);
		}
		formattedList = snackCart[userName].join(', ')

	});
}

// Get User by ID
function findUserById(messengerId) {
	userInfo = allUsers.filter((user) => {
		return user.id === messengerId
	})
	return userInfo.length === 1 ? userInfo[0].real_name : undefined
}
