let renderAndSortObjects = (function(){
	let countObject = null,
		countElemPage = null,
		countPage = 1,
		countElem = null,
		objects = {"listObject": []},
		numberFullPages = null,
		objectsLastPage = null,
		objectsBtnMore = document.querySelector(".objects_btn_more"),
		objectsTitle = document.querySelector(".objects_title");
	
	function CreateRequest() {
		let Request = false;
	
		if (window.XMLHttpRequest){
			Request = new XMLHttpRequest();
		}
		else if (window.ActiveXObject)
		{
			try {
				 Request = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (CatchException){
				 Request = new ActiveXObject("Msxml2.XMLHTTP");
			}
		}
	 
		if (!Request){
			alert("Невозможно создать XMLHttpRequest");
		}
		
		return Request;
	} 
	
	/* r_method  - тип запроса: GET или POST, r_path    - путь к файлу, r_handler - функция-обработчик ответа от сервера */
	$.urlParam = function(name){
		let results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
		if (results == null){
		   return null;
		} else {
		   return decodeURI(results[1]) || 0;
		}
	}

	function SendRequest(r_method, r_path, r_handler) {
		let Request = CreateRequest();
		if (!Request){return;}
		
		Request.onreadystatechange = function() {
			if (Request.readyState == 4) {
				if (Request.status == 200) {
					r_handler(Request);
				} else { alert("Error")}
			} else { }
		}
		
		let urlSearch = window.location.search;
	
		if (r_method.toLowerCase() == "get" && urlSearch.length > 0)
		r_path += urlSearch
		
		Request.open(r_method, r_path, true);
		
		if (r_method.toLowerCase() == "post") { 
			Request.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=utf-8");
			Request.send(urlSearch);
		} else {
			Request.send(null);
		}
	}

	let update = {
		data: function(data){
			if(data.length){
				countObject = data[1];
				countElemPage = data[2];
				numberFullPages = Math.ceil(countObject/countElemPage);
			}
		},
		objects: function(){
			objects = {"listObject": []}
		},
		countElem: function(){
			if(countPage <= numberFullPages - 1){
				countElem = countElemPage * countPage;
			} else {
				countElem = countObject;
			}
		},
		countPage: function(){
			let search = window.location.search;
			if(search){
				let page = $.urlParam("page");
				if(page !== null){
					if(page <= numberFullPages){
						countPage = page
					}
				}
			}
		},
		textBtnShowObjects: function(data){
			if(data[0].length){
				if(countPage == numberFullPages - 1){
					objectsLastPage = countObject - ((numberFullPages-1) * countElemPage);
					objectsBtnMore.innerHTML = 	"показать еще <span>" + objectsLastPage + "</span>"
				} else if(countPage < numberFullPages){
					objectsBtnMore.innerHTML = 	"показать еще <span>" + countElemPage + "</span>"
				} else {
					objectsBtnMore.innerHTML = "Это все объекты"
				}
			} else {
				objectsBtnMore.innerHTML = "Объектов не найдено!"
			}
		},
		titlePage: function(data){
			if(data[0].length){
				objectsTitle.textContent = "Найдено " + countObject + " квартир";
			} else {
				objectsTitle.textContent = "Объектов не найдено!";
			}
		},
		sortMenu: function(){
			let search = document.location.search;
			if(search){
				let sort = $.urlParam("sort");
				let sortOrder = $.urlParam("order"); 
				if(sort){
					let sortItem = document.querySelector("[data-sort=" + sort + "]");
					if(sortItem){
						sortItem.classList.add("sort-active");
						sortItem.classList.add("active");

						if(sortOrder === "asc"){
							sortItem.dataset.order = "desc";
						} else {
							sortItem.dataset.order = "asc";
						}
					}
				}
			}
		}
	}

	let renderPage = {
		update: function(objects){
			let objectsTemplate = $("#oblects-container").html();
			let compiledTemplate = Handlebars.compile(objectsTemplate);
		
			$("#objects-list").html(compiledTemplate(objects));
		},
		add: function(objects){
			let objectsTemplate = $("#oblects-container").html();
			let compiledTemplate = Handlebars.compile(objectsTemplate);
		
			$("#objects-list").append(compiledTemplate(objects));
		}
	}

	let eventPage = {
		btnShowObjects: function(){
			if(objectsBtnMore){
				objectsBtnMore.addEventListener("click", addSomeObjects, false);
			}
		},
		btnSortObjects: function(){
			let sortItems = document.querySelectorAll(".sort_item");
			if(sortItems){
				for(let i = 0; i < sortItems.length; i++){
					sortItems[i].addEventListener("click", sortObjects, false);
				}
				update.sortMenu();
			}
		}
	}
	eventPage.btnSortObjects();

	let requestDB = {
		updatePage: function(url){
			let Handler = function(Request){
				
				let data = JSON.parse(Request.response);
			
				update.objects();
				update.data(data);
				update.titlePage(data);
				update.countPage();
				update.countElem();
				update.textBtnShowObjects(data);
	
				if(data[0].length){	
					for(let i = 0; i < countElem; i++){	
						data[0][i].price = data[0][i].price.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
						objects["listObject"].push(data[0][i]);
					}
					
					eventPage.btnShowObjects();
					renderPage.update(objects);
				}
			}
			//Отправляем запрос
			SendRequest("GET", url, Handler);
		},
		addObjects: function(url){
			let Handler = function(Request){
			
				let data = JSON.parse(Request.response);
	
				update.objects();
				update.textBtnShowObjects(data);
	
				if(data[0].length){
					for(let i = 0; i < data[0].length; i++){
						data[0][i].price = data[0][i].price.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
						objects["listObject"].push(data[0][i]);
					}
					renderPage.add(objects);
				}
			}
			//Отправляем запрос
			SendRequest("GET", url, Handler);
		}
	}
	requestDB.updatePage("db.php");
	
	let urlParams = {
		sort: function(current){
			let sort = current.dataset.sort;
			let sortOrder = current.dataset.order;
		
			if(sortOrder === "asc" || sortOrder === "desc"){
				if(sort === "price" || sort === "room"){
					this.replaceHistoryUrl("?sort=" + sort + "&order=" + sortOrder + "&page=" + countPage);
				} else {return;}
			} else {return;}
		},
		sortPage: function(){
			let search = document.location.search;
			let sort = null;
	
			if(search){
				let pos = search.indexOf('&page');
				if(pos !== -1) {
					sort = search.substr(0, pos);
					this.replaceHistoryUrl(sort + "&page=" + countPage);
				} else {
					pos = search.indexOf('?page');
					if(pos !== -1) {
						sort = search.substr(0, pos);
						this.replaceHistoryUrl(sort + "?page=" + countPage);
					}
				}
			} else {
				this.replaceHistoryUrl("?page=" + countPage);
			}
		},
		replaceHistoryUrl: function(url){
			history.replaceState(null, null, url);
		}
	}

	function addSomeObjects(){
		if(countPage < numberFullPages){
			countPage++;
			urlParams.sortPage();	
			requestDB.addObjects("dbpage.php");
		}
	}

	function sortObjects(event){
		setActiveSorting(event);
		requestDB.updatePage("db.php");
	}
	
	function setActiveSorting(event){
		let current = event.target;
		if(current.tagName === "svg" || current.tagName === "DIV"){
			current = findELemDepth(current.parentElement, "sort_item");
			current.classList.toggle("active");
			urlParams.sort(current);
			setActiveSort(current)
		} else {
			current.classList.toggle("active");
			urlParams.sort(current);
			setActiveSort(current)
		}
	}

	function setActiveSort(current){
		let sort = current.dataset.sort;
		let sortOrder = current.dataset.order;
		if(sort === "price"){
			current.classList.add("sort-active");
			current.nextElementSibling.classList.remove("sort-active");
		} else if(sort === "room"){
			current.classList.add("sort-active");
			current.previousElementSibling.classList.remove("sort-active");
		}

		if(sortOrder === "asc"){
			current.dataset.order = "desc";
		} else {
			current.dataset.order = "asc";
		}
	}
});
renderAndSortObjects();

/* Метод для моб. миню */
let h_map = document.querySelector(".h_map");
if(h_map){
	h_map.addEventListener("click", activeMenuMobile, false);
}

function activeMenuMobile() {
	this.classList.toggle("open");
	let menu = document.querySelector(".header_nav");
	let body = document.querySelector("body");
	if(menu){
		menu.classList.toggle("open");
		body.classList.toggle("is-open");
	}
}

/* Методы для формы подписки */
function eventSubscriptionForm(){
	let formBtn = document.querySelector("input[data-form='btn']");
	let fieldEmail = document.querySelector("input[data-field='email']");
	let consent = document.querySelector("[data-id='consent']");

	if(formBtn){
		formBtn.addEventListener("click", sendForm, false);
	}

	if(fieldEmail){
		fieldEmail.addEventListener("input", handlingFieldEmail, false);
	}
	if(consent){
		consent.addEventListener("click", handlingFieldConsent, false);
	}
}
eventSubscriptionForm();

function handlingFieldEmail(event){
	let fuiedEmail = event.target;
		wrapperInput = findELemDepth(fuiedEmail.parentElement, "wrapper_input"),
		message = wrapperInput.querySelector(".error_message");

	errorMessage.removeMessage(message);
}

function handlingFieldConsent(event){
	let consent = event.target;
	checkboxConsent = findELemDepth(consent.parentElement, "checkbox_consent"),
	message = checkboxConsent.querySelector(".error_message");

	errorMessage.removeMessage(message);
}

function sendForm(event){
	event.preventDefault();
	let currrent = event.target,
		form = findELemDepth(currrent.parentElement ,"form"),
		fieldEmail = form.querySelector("input[data-field='email']");
		
	let validForm = handlingForm(form);

	if(validForm){
		fieldEmail.value = "";
		alert("данные отправлены");
	}
}

function handlingForm(form){

	let fieldEmail = form.querySelector("input[data-field='email']"),
		val = fieldEmail.value.trim(),
		fieldConsent = form.querySelector("#consent"),
		consent = fieldConsent.checked,
		valid = false;

	if(val){
		valid = validateEmail(val);
		if(!valid){
			fieldEmail.value = val;
			errorMessage.setMessage(fieldEmail, "некорректный email");
			return valid
		}
	} else {
		fieldEmail.value = "";
		errorMessage.setMessage(fieldEmail, "обязательное поле");
		return valid
	}

	if(consent){
		valid = consent;
	} else {
		valid = consent;
		errorMessage.setMessage(fieldConsent, "Подтвердите согласие");
	}

	return valid
}

function validateEmail(email) {
	let pattern  = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,6})$/;
	return pattern.test(email);
}

let errorMessage = {
	setMessage: function(field, text) {
		let wrapperInput = field.parentElement,
			message = wrapperInput.querySelector(".error_message");
			message.firstElementChild.innerHTML = text;
			message.classList.add("active");
	},
	removeMessage: function(message) {
		message.classList.remove("active");
	},
}

/* Метод для поиска элементов по классу из глубины (у метода есть недостатки) */
function findELemDepth(current, classFind){
	if(current.classList.contains(classFind)){
		return current;
	} else {
		return findELemDepth(current.parentElement, classFind);
	}
}

(function() {

	function trackScroll() {
		let scrolled = window.pageYOffset;
		let coords = document.documentElement.clientHeight;

		if (scrolled > coords) {
			goTopBtn.classList.add('up');
		}
		if (scrolled < coords) {
			goTopBtn.classList.remove('up');
		}
	}

	function backToTop() {
		if (window.pageYOffset > 0) {
			window.scrollBy(0, -25);
			setTimeout(backToTop, 0);
		}
	}

	let goTopBtn = document.querySelector('#btntop');

	window.addEventListener('scroll', trackScroll);
	goTopBtn.addEventListener('click', backToTop);
})();