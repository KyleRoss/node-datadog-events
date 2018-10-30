"use strict";

module.exports = function dataDogSendEvents() {
    
    
    ['error', 'warning', 'info', 'success'].forEach(type => {
        this[type] = (title, body, options = {}) => {
            return this.sendEvent(type, title, body, options);
        };
    });
};
