var main = (function() {
  var NETTRAP_SERVICE_UUID = '5794ba16-ce64-46e5-9804-6851f7b3a183';
  var NETTRAP_WAS_NET_DROPPED_CHARACTERISTIC_UUID = 'fbb3136a-fe49-445b-a612-2019d1b33a6c'; // bool
  var NETTRAP_IS_NET_DISARMED_CHARACTERISTIC_UUID = 'f80fb006-0e8e-412c-8a92-19fe85328daa'; // bool


  function NetTrap() {
    // put any properties we need here
    this.no_device = false;
    this.net_disarmed = true;
    this.net_dropped = false;
  };

  NetTrap.prototype.handleService = function(service) {
    UI.getInstance.resetState(); // we can be in 3 possible states: no device, trap not sprung, trap sprung
    var self = this;
    chrome.bluetoothLowEnergy.getCharacteristics(service.instanceId,
                                                 function (chrcs) {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
        return;
      }

      // Make sure that the same service is still selected.
      if (service.instanceId != self.service_.instanceId)
        return;

      if (chrcs.length == 0) {
        console.log('Service has no characteristics: ' + service.instanceId);
        return;
      }
      // DRY this up
      chrcs.forEach(function (chrc) {
        if (chrc.UUID == NETTRAP_IS_NET_DISARMED_CHARACTERISTIC_UUID) {
          chrome.bluetoothLowEnergy.readCharacteristicValue(chrc.instanceId, function( readChrc ) {
            // this code is super defensive, i assume that's necessary?
            if (chrome.runtime.lastError) {
              console.log(chrome.runtime.lastError.message);
              return;
            }
            // i'm not doing one of the checks from the original code
            self.net_disarmed = readChrc.value;
          });
        }
        if (chrc.UUID == NETTRAP_WAS_NET_DROPPED_CHARACTERISTIC_UUID) {
          chrome.bluetoothLowEnergy.readCharacteristicValue(chrc.instanceId, function ( readChrc ) {
            if (chrome.runtime.lastError) {
              console.log(chrome.runtime.lastError.message);
              return
            }
            self.net_dropped = readChrc.value;
          });
        }
      });
  });
  this.redrawBody();
};

  NetTrap.prototype.redrawBody = function() {
    UI.getInstance().resetState(this.no_device,this.net_dropped,this.net_disarmed);
  };

  NetTrap.prototype.init = function() {
    // default state of app
    this.redrawBody();

    // set up info on local bluetooth radio just out of interest
    var updateAdapterState = function(adapterState) {
      UI.getInstance().setAdapterState(adapterState.address, adapterState.name);
    };

    chrome.bluetooth.getAdapterState(function (adapterState) {
      if (chrome.runtime.lastError)
        console.log(chrome.runtime.lastError.message);

      updateAdapterState(adapterState);
    });

    chrome.bluetooth.onAdapterStateChanged.addListener(updateAdapterState);

    // Find the trap device
    chrome.bluetooth.getDevices(function (devices) {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
      }

      if (devices) {
        devices.forEach(function (device) {
          chrome.bluetoothLowEnergy.getServices(device.address,
            function (services) {
            if (chrome.runtime.lastError) {
              console.log(chrome.runtime.lastError.message);
              return;
            }

            if (!services)
              return;

            services.forEach(function (service) {
              if (service.uuid == NETTRAP_SERVICE_UUID) {
                console.log('Found NetTrap service!');
                this.no_device = false;
                this.handleService(service);
              }
            });
            // might get rid of this stuff?
            if (!this.no_device)
              return;

            console.log('Found device with NetTrap service: ' + device.address);
          });
        });
      }
    });

  }; // close init function
  return { NetTrap : NetTrap }; // i don't actually know what this does?
})(); // main calls itself to set all this stuff up

document.addEventListener('DOMContentLoaded', function() {
  var nettrap = new main.NetTrap();
  nettrap.init();
});