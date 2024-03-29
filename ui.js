var UI = (function() {

  // Common functions used for tweaking UI elements.
  function UI() {
  }

  // Global instance.
  var instance;

  UI.prototype.resetState = function(noDevice,dropped,disarmed) {
    console.log("no device is " + noDevice + " net dropped is " + dropped + " net disarmed is " + disarmed);
    document.getElementById('no-devices-error').hidden = !noDevice;
    document.getElementById('trap-sprung-div').hidden = noDevice || !dropped;
    document.getElementById('trap-armed-div').hidden = noDevice || dropped || disarmed;
    document.getElementById('trap-disarmed-div').hidden = noDevice || dropped || !disarmed;
  };

  UI.prototype.setAdapterState = function(address, name) {
    var addressField = document.getElementById('adapter-address');
    var nameField = document.getElementById('adapter-name');

    var setAdapterField = function (field, value) {
      field.innerHTML = '';
      field.appendChild(document.createTextNode(value));
    };

    setAdapterField(addressField, address ? address : 'unknown');
    setAdapterField(nameField, name ? name : 'Local Adapter');
  };

  UI.prototype.setArmTrapHandler = function(handler) {
    document.getElementById('arm-trap').onclick = handler;
  };

  UI.prototype.setDisarmTrapHandler = function(handler) {
    document.getElementById('disarm-trap').onclick = handler;
  };

  UI.prototype.setResetTrapHandler = function(handler) {
    document.getElementById('reset-trap').onclick = handler;
  };

  return {
    getInstance: function() {
      if (!instance) {
        instance = new UI();
      }

      return instance;
    }
  };
})();