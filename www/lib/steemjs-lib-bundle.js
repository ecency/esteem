var PrivateKey = require("../../ecc/src/PrivateKey");
var key = require("../../ecc/src/KeyUtils");

class KeyCache {
    constructor() {
        this._keyCachePriv = new Map();
        this._keyCachePub = new Map();
        this._myKeys = new Map();
    }

    setPrivKey(key, privKey) {
        this._keyCachePriv.set(key, privKey);
    }

    hasPrivKey(key) {
        return this._keyCachePriv.has(key);
    }

    getPrivKey(key) {
        return this._keyCachePriv.get(key)
    }

    setPubKey(key, pubKey) {
        this._keyCachePub.set(key, pubKey);
    }

    hasPubKey(key) {
        return this._keyCachePub.has(key);
    }

    getPubKey(key) {
        return this._keyCachePub.get(key);;
    }

    setMyKey(key, privKey) {
        this._myKeys.set(key, privKey);
    }

    getMyKey(key) {
        return this._myKeys.get(key);
    }
}


class AccountLogin {

    constructor() {
        this.reset();
        this.keyCache = new KeyCache();
    }

    reset() {
        this.state = {loggedIn: false, roles: ["active", "owner", "posting", "memo"]};

        this.subs = {};
    }

    addSubscription(cb) {
        this.subs[cb] = cb;
    }

    setRoles(roles) {
        this.state.roles = roles;
    }

    getRoles() {
        return this.state.roles;
    }

    generateKeys(accountName, password, roles, prefix) {
        if (!accountName || !password) {
            throw new Error("Account name or password required");
        }
        if (password.length < 12) {
            throw new Error("Password must have at least 12 characters");
        }

        let privKeys = {};
        let pubKeys = {};

        (roles || this.state.roles).forEach(role => {
            let seed = accountName + role + password;
            let pkey = this.keyCache.hasPrivKey(role) ? this.keyCache.getPrivKey(role) :  PrivateKey.fromSeed( key.normalize_brainKey(seed) );
            this.keyCache.setPrivKey(role, pkey);

            privKeys[role] = pkey;
            pubKeys[role] = this.keyCache.getPubKey(role) ? this.keyCache.getPubKey(role) : pkey.toPublicKey().toString(prefix);

            this.keyCache.setPubKey(role, pubKeys[role]);
        });

        return {privKeys, pubKeys};
    }

    fromPrivKey(accountName, privateKey, roles, prefix) {
        if (!privateKey) {
            return null;
        }
        let privKeys = {};
        let pubKeys = {};

        (roles || this.state.roles).forEach(role => {

            let pkey = this.keyCache.hasPrivKey(role) ? this.keyCache.getPrivKey(role) : PrivateKey.fromWif( privateKey );
            this.keyCache.setPrivKey(role, pkey);

            privKeys[role] = pkey;
            pubKeys[role] = this.keyCache.getPubKey(role) ? this.keyCache.getPubKey(role) : pkey.toPublicKey().toString(prefix);

            this.keyCache.setPubKey(role, pubKeys[role]);
        });

        return {privKeys, pubKeys};
    }

    getPubKeys() {
        return this.state.roles.map(role => {
            return this.keyCache.getPubKey(role);
        });
    }

    checkKeys({accountName, password, auths, privateKey = null}) {
        if (!accountName || (!password && !privateKey) || !auths) {
            throw new Error("checkKeys: Missing inputs");
        }
        let hasKey = false;
        for (let role in auths) {
            let keys;
            if (password) {
                keys = this.generateKeys(accountName, password, [role]);
            } else if (privateKey) {
                keys = this.fromPrivKey(accountName, privateKey, [role]);
            }

            if (keys && Object.keys(keys).length) {
                let {privKeys, pubKeys} = keys;
                    auths[role].forEach(key => {
                        if (key[0] === pubKeys[role]) {
                            hasKey = true;
                            this.keyCache.setMyKey(role, {priv: privKeys[role], pub: pubKeys[role]});
                        }
                    });
                }
            };

        if (hasKey) {
            this.name = accountName;
        }

        this.state.loggedIn = hasKey;

        return hasKey;
    }

    signTransaction(tr, signerPubkeys = {}, requiredPubkeys) {

        let myKeys = {};
        let hasKey = false;

        this.state.roles.forEach(role => {
            let myKey = this.keyCache.getMyKey(role);
            if (myKey) {
                if (signerPubkeys[myKey.pub]) {
                    hasKey = true;
                    return;
                }
                hasKey = true;
                signerPubkeys[myKey.pub] = true;
                if (requiredPubkeys && requiredPubkeys.indexOf(myKey.pub) !== -1) {
                    tr.add_signer(myKey.priv, myKey.pub);
                } else if (!requiredPubkeys) {
                    tr.add_signer(myKey.priv, myKey.pub);
                }


            }
        });

        if (!hasKey) {
            console.error("You do not have any private keys to sign this transaction");
            throw new Error("You do not have any private keys to sign this transaction");
        }
    }
}

window.AccountLogin = AccountLogin;