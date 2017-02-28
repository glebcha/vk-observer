const navigatorModifier =  '(' + function() {
    const userAgent = 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_6; en-US) AppleWebKit/533.20.25 (KHTML, like Gecko) Version/5.0.4 Safari/533.20.27';
    const appVersion = '5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14';
    const platform = 'MacIntel';
    const navigator = window.navigator;
    let modifiedNavigator;

    if ('userAgent' in Navigator.prototype) {
        modifiedNavigator = Navigator.prototype;
    } else {
        modifiedNavigator = Object.create(navigator);

        Object.defineProperty(window, 'navigator', {
            value: modifiedNavigator,
            configurable: false,
            enumerable: false,
            writable: false
        });
    }

    Object.defineProperties(modifiedNavigator, {
        userAgent: {
            value: userAgent,
            configurable: false,
            enumerable: true,
            writable: false
        },
        appVersion: {
            value: appVersion,
            configurable: false,
            enumerable: true,
            writable: false
        },
        platform: {
            value: platform,
            configurable: false,
            enumerable: true,
            writable: false
        },
    });
} + ')();';

const modifierScript = document.createElement('script');

modifierScript.textContent = navigatorModifier;
document.documentElement.appendChild(modifierScript);
modifierScript.remove();
