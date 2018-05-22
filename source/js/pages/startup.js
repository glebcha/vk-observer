const navigatorModifier =  '(' + function() {
    window.MediaSource = null
} + ')();';

const modifierScript = document.createElement('script');

modifierScript.textContent = navigatorModifier;
document.documentElement.appendChild(modifierScript);
modifierScript.remove();
