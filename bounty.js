function runningFormatter(value, row, index) {
  return index;
}


document.addEventListener('DOMContentLoaded', function() {
  var config = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: ""
  }

  firebase.initializeApp(config);


});
var firebaseRef = new Firebase("https://bounty-a8d8e.firebaseio.com");

const loadDataPromise = new Promise(function(resolve, reject) {
  firebaseRef.once('value', function(snapshot) {
    snapshotToArray(snapshot);
    // console.log('what is this:', whatisthis);
    resolve('Worked');
  })
});

var view = {
  data: [],

  addData: function(location, address, bounty, items, status, itemKey) {
    this.data.push({
      location: location,
      address: address,
      bounty: bounty,
      items: items,
      status: status,
      itemKey: itemKey
    })
},
};

function snapshotToArray(snapshot) {
  //var returnArr = [];v
  var x = 0;
  snapshot.forEach(function(childSnapshot) {
    x++;
    console.log(x);
    var item = childSnapshot.val();
    var key = childSnapshot.key();
    console.log('key', key);
    view.addData(item.location, item.address, item.bounty, item.items, item.status, key);


  });

  return view.data;
};

function logIn() {
  function newLoginHappened(user) {
    if (user) {
      //uawe ia signed in
      console.log(user);
      app(user);
    } else {
      console.log("no user");
      //next line will never happen when depolyed - only for testing
      document.getElementById("userName").innerHTML = "no user";
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithRedirect(provider);
    }
  }
  firebase.auth().onAuthStateChanged(newLoginHappened);

};

function app(user) {
  document.getElementById("userName").innerHTML = user.displayName;
};

function setUpEventListeners() {
  document.getElementById("adminButton").addEventListener("click", adminPage);
  document.getElementById('addEm').addEventListener('click', addOneLineOfData);

};

function adminPage() {
  let fireBaseUser = firebase.auth().currentUser.displayName;
  if (fireBaseUser === "xxxxxxx") {

    let adminButton = document.getElementById('inputForm').style.display;
    if (adminButton == "block") {
      adminButton = 'none';
    } else if (adminButton == "none") {
      adminButton = 'block';
    }
    document.getElementById('inputForm').style.display = adminButton;
    //  document.getElementById("inputForm").style.display = "block";
  };
};

function addOneLineOfData() {
  console.log("data ready to be pushed");

  var dataLocal = {
    location: $("#addLocation").val(),
    address: $("#addAddress").val(),
    bounty: $("#addBounty").val(),
    items: $("#addItems").val(),
    status: $("#addStatus").val()
  };


  let newKey = writeOneRecordtoFirebase(dataLocal);
  refreshTable($("#addLocation").val(), $("#addAddress").val(), $("#addBounty").val(), $("#addItems").val(), $("#addStatus").val(), newKey);

  //  view.addData($("#addLocation").val(), $("#addAddress").val(), $("#addBounty").val(), $("#addItems").val(), $("#addStatus").val(), newKey);
  // how can i do the below with jquery?//
  document.getElementById("addLocation").value = "";
  document.getElementById("addAddress").value = "";
  document.getElementById("addBounty").value = "";
  document.getElementById("addItems").value = "";
  document.getElementById("addStatus").value = "";
};

function writeOneRecordtoFirebase(dataToPush) {

  var newKey = firebaseRef.push(dataToPush).key();

  return newKey;
};

function refreshTable(location, address, bounty, items, status) {
  var $table = $('#bountyTable');
  row = view.data.length;
  console.log(row);
  $table.bootstrapTable('insertRow', {
    index: row,
    row: {
      location: location,
      address: address,
      bounty: bounty,
      items: items,
      status: status
    }
  });
};

function updateItemUser(rowToUpdate) {
  const currentUser = document.getElementById("userName").innerHTML;
  if (view.data[rowToUpdate].status === "No User" || (currentUser === "xxxxx")){

  var $table = $('#bountyTable');
  $table.bootstrapTable('updateRow', {
    index: rowToUpdate,
    row: {
      location: view.data[rowToUpdate].location,
      address: view.data[rowToUpdate].address,
      bounty: view.data[rowToUpdate].bounty,
      items: view.data[rowToUpdate].items,
      status: document.getElementById("userName").innerHTML
    }
  });
  let dbItemKey = (view.data[rowToUpdate].itemKey);
  console.log('bd:', dbItemKey);
  mMessagesDatabaseReference = firebaseRef.child(dbItemKey).child("status");
  mMessagesDatabaseReference.set(document.getElementById("userName").innerHTML);
};
};


$(document).ready(function() {
  logIn();
  //should I move the standard js event listeners down here and make them jquery listeners
  var $result = $('#eventsResult');

  $('#bountyTable').on('click-row.bs.table', function(e, row, $element) {
    var row_num = $element.index();
    console.log('Row number', row_num);
    updateItemUser(row_num);
  });

  loadDataPromise.then(function(result) {
    $("#bountyTable").bootstrapTable({
        data: view.data,
        formatLoadingMessage: function() {
          return "";
        }
      }),
      function(err) {
        console.log("firebase error", err);
      }

  });
  setUpEventListeners(); //probably should move this down here and make them jquery
});
