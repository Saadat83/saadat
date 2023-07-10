const ul = document.querySelector("ul");
const addName = document.querySelector(".add_name");
const addEmail = document.querySelector(".add_email");
const addPhone = document.querySelector(".add_phone");
const addButton = document.querySelector(".add_button");
const filterBtns = document.querySelectorAll(".filter_btn");
const searchInput  = document.querySelector(".search_input");


const state = { //хранилище данных
  contacts: []
}


getContacts();
function getContacts() {
  fetch("http://localhost:8000/contacts")
    .then((response) => response.json())
    .then((data) => {
      state.contacts = data
      render(state.contacts);
    });
}

function render(contacts) {
  ul.innerHTML = "";
    contacts.forEach((el) => {
      ul.insertAdjacentHTML(
        "beforeend", 
        `<li data-id="${el.id}">
          <input type="checkbox" class="switch_checkbox" ${
            el.registered ? "checked" : ""
          }/>
          <div class ="edit_form hide">
              <input type="text" class="input_name" value="${el.Name}">
              <input type="text" class="input_email" value="${el.email}">
              <input type="text" class="input_phone" value="${el.phone}">
              <button class ="btn_save">Save</button>
          </div>
          <span class="name">${el.Name}</span>
          <span class="email">${el.email}</span>
          <span class="phone_number">${el.phone}</span>
          <button class="btn_edit">Edit</button>
          <button class="btn_delete">Delete</button>
        </li>
        `
      );
    });
  }

function addContact(newContact) {
  fetch("http://localhost:8000/contacts", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(newContact),
  })
    .then((response) => response.json())
    .then((data) => {
      state.contacts.push(data)
      render(state.contacts);
  });
}

function removeContact(id) {
  fetch(`http://localhost:8000/contacts/${id}`, {
    method: "DELETE"
  })
    .then((response) => response.json())
    .then(() => {
      state.contacts = state.contacts.filter(el => el.id !== id)
      render(state.contacts)
  });
};

function editContact(id, editObj) {
  fetch(`http://localhost:8000/contacts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(editObj),
    headers: {
      "Content-type": "application/json", //мы хотим общаться с бэкендом через json формат
    }
  })
    .then((response) => response.json())
    .then((data) => {
      state.contacts = state.contacts.map(el => {
        if(el.id === data.id) {
          return data
        } else {
          return el
        }
      })
      render(state.contacts)
  });
}

function filterContacts(status) {
  if(status === "registered") {
    fetch("http://localhost:8000/contacts?registered=true")
    .then((res) => res.json())
    .then((data) => {
      state.contacts = data;
      render(state.contacts)
    });
  } else if (status === "not_registered") {
    fetch("http://localhost:8000/contacts?registered=false")
      .then((res) => res.json())
      .then((data) => {
        state.contacts = data
        render(state.contacts)
    });
  } else {
    fetch("http://localhost:8000/contacts")
    .then((res) => res.json())
    .then((data) => {
      state.contacts = data
      render(state.contacts)
    });
}};

function searchContacts(value) {
  fetch(`http://localhost:8000/contacts?q=${value}`)
    .then((res) => res.json())
    .then((data) => {
      state.contacts = data;
      render(state.contacts);
    })
}

addButton.addEventListener("click", function () {
    const obj = {
      Name: addName.value,
      email: addEmail.value,
      phone: addPhone.value,
      registered: true
    };
    addContact(obj);
  });

document.addEventListener("click", function(e) { 
  if(e.target.classList.contains("btn_delete")) {
    const parentLi = e.target.parentNode
    const currentId = +parentLi.getAttribute("data-id");
    removeContact(currentId)
  }
})
  
document.addEventListener("click", function(e) { //тк delete добавили динамически
  if(e.target.classList.contains("btn_edit")) {
      e.target.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.classList.remove("hide")
  }
})

document.addEventListener("click", function(e) { 
  if(e.target.classList.contains("btn_save")) {
    const parentLi = e.target.parentNode.parentNode;
    const currentId = +parentLi.getAttribute("data-id");
    const editObj ={
      Name: e.target.previousElementSibling.previousElementSibling.previousElementSibling.value, 
      email: e.target.previousElementSibling.previousElementSibling.value,
      phone: e.target.previousElementSibling.value

    }
    editContact(currentId, editObj) //editObj -идет как бади, на что мне надо заменить
  }
})

document.addEventListener("click", function(e) { 
  if(e.target.classList.contains("switch_checkbox")) {
    const parentLi = e.target.parentNode;
    const currentId = +parentLi.getAttribute("data-id");
    const currentStatus = e.target.checked
    const switchObj = {
      registered: currentStatus
    };
    editContact(currentId, switchObj)
  };
  
});

document.addEventListener("click", function(e) { 
  if(e.target.classList.contains("filter_btn")) {
    filterBtns.forEach(el => {
      el.classList.remove("active")
    })
    e.target.classList.add("active")
    const currentFilterStatus = e.target.getAttribute("data-filter")
    filterContacts(currentFilterStatus)
  }
})

searchInput.addEventListener("input", function(e) {
  searchContacts(e.target.value)
})