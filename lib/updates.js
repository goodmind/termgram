//     Termgram
//     Copyright 2015 Enrico Stara 'enrico.stara@gmail.com'
//     Released under the MIT License
//     http://termgram.me

// import the dependencies
require('requirish')._(module);
require('colors');

var clientProxy = require('lib/client-proxy');
var getLogger = require('get-log');
var logger = getLogger('update-emitter');

var UPDATE_INTERVAL = 1000;

function Updates() {
}

// Start the emitter.
Updates.prototype.start = function () {
    var self = this;
    logger.info('start updates');
    console.log('start updates');
    return new Promise(function (fulfill, reject) {
        try {
            clientProxy.getClient().account.updateStatus(false).then(function () {
                clientProxy.getClient().registerOnUpdates(function (update) {
                    switch (update.getTypeName()) {
                        case 'api.type.UpdatesTooLong':
                            self.forceGetDifference();
                            break;
                    }
                });
                try {
                    clientProxy.getClient().updates.getState().then(function (state) {
                        try {
                            setState.call(self, state);
                            clientProxy.getClient().on('error', function (error) {
                                console.log('client error', error.stack);
                            });
                            clientProxy.getClient().httpPoll();
                            setTimeout(fulfill, 100);
                            //fulfill();
                        } catch (e) {
                            reject(e)
                        }
                    }, reject);
                } catch (e) {
                    reject(e)
                }
            });
        } catch (e) {
            reject(e)
        }
    });
};

function setState(state) {
    this.pts = state.pts;
    this.date = state.date;
    this.qts = state.qts;
    this.unreadCount = state.unread_count;
    logger.info('set state', state.toPrintable());
    console.log('set state', state.toPrintable());
}

Updates.prototype.getDifference = function () {
    var self = this;
    clientProxy.getClient().updates.getDifference(this.pts, this.date, -1).then(function (result) {
        console.log('getDifference', result);

        /*if (result.getTypeName() === 'api.type.updates.DifferenceEmpty') {
            console.log('apply empty diff', result.seq);
            setState.call(self, {date: result.date});
            return false;
        }

        var nextState = result.intermediate_state || result.state;
        setState.call(self, nextState);

        if (result.getTypeName() === 'api.type.updates.DifferenceSlice') {
            self.getDifference();
        }*/
    }).catch(function (error) {
        console.log('getDifference error: ', error.stack);
    });
};

Updates.prototype.forceGetDifference = function () {
    return this.getDifference();
};


// Stop the emitter.
Updates.prototype.stop = function () {
    logger.info('stop updates');
    console.log('stop updates');
    clientProxy.getClient().stopHttpPollLoop();
    clientProxy.getClient().account.updateStatus(true);
};

var instance;
Updates.getInstance = function () {
    return instance = instance || new Updates();
};

// export the services
module.exports = exports = Updates;