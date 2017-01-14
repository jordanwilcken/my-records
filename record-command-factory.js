recordCommandFactory = {
  makeInsertCommand: function(connectionString, records) {
    return {
      execute: function() {
        console.log(records.length + ' records inserted.');
        return "";
      }
    }
  },

};

module.exports = recordCommandFactory;
