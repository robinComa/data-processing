/*
 * DataProcessing.Class powers the OOP facilities of the library.
 * Thanks to John Resig and Dean Edwards for inspiration!
 */

DataProcessing.Class = function () {};

DataProcessing.Class.extend = function (props) {

    /** Serialize Object */
    this.prototype.serialize = function(){
        return btoa(JSON.stringify(this));
    };

    // extended class with the new prototype
    var NewClass = function () {

        // call the constructor
        if (this.initialize) {
            this.initialize.apply(this, arguments);
        }

        // call all constructor hooks
        if (this._initHooks.length) {
            this.callInitHooks();
        }
    };

    // jshint camelcase: false
    var parentProto = NewClass.__super__ = this.prototype;
    // jshint camelcase: true

    var proto = DataProcessing.Util.create(parentProto);
    proto.constructor = NewClass;

    NewClass.prototype = proto;

    //inherit parent's statics
    for (var i in this) {
        if (this.hasOwnProperty(i) && i !== 'prototype') {
            NewClass[i] = this[i];
        }
    }

    // mix static properties into the class
    if (props.statics) {
        DataProcessing.extend(NewClass, props.statics);
        delete props.statics;
    }

    // mix includes into the prototype
    if (props.includes) {
        DataProcessing.Util.extend.apply(null, [proto].concat(props.includes));
        delete props.includes;
    }

    // merge options
    if (proto.options) {
        props.options = DataProcessing.Util.extend(DataProcessing.Util.create(proto.options), props.options);
    }

    // mix given properties into the prototype
    DataProcessing.extend(proto, props);

    proto._initHooks = [];

    // add method for calling all hooks
    proto.callInitHooks = function () {

        if (this._initHooksCalled) { return; }

        if (parentProto.callInitHooks) {
            parentProto.callInitHooks.call(this);
        }

        this._initHooksCalled = true;

        for (var i = 0, len = proto._initHooks.length; i < len; i++) {
            proto._initHooks[i].call(this);
        }
    };

    return NewClass;
};


// method for adding properties to prototype
DataProcessing.Class.include = function (props) {
    DataProcessing.extend(this.prototype, props);
};

// merge new default options to the Class
DataProcessing.Class.mergeOptions = function (options) {
    DataProcessing.extend(this.prototype.options, options);
};

// add a constructor hook
DataProcessing.Class.addInitHook = function (fn) { // (Function) || (String, args...)
    var args = Array.prototype.slice.call(arguments, 1);

    var init = typeof fn === 'function' ? fn : function () {
        this[fn].apply(this, args);
    };

    this.prototype._initHooks = this.prototype._initHooks || [];
    this.prototype._initHooks.push(init);
};