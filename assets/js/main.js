const listContainer = document.querySelector("[data-list]");
const newListForm = document.querySelector('[data-new-list-form]');
const newListInput = document.querySelector('[data-new-list-input]');
const deleteListButton = document.querySelector('[data-delete-list-button]');
const listDisplayContainer = document.querySelector('[data-list-display-container]');
const listTitleElement = document.querySelector('[data-list-title]');
const listCountElement = document.querySelector('[data-list-count]');
const tasksContainer = document.querySelector('[data-tasks]');
const taskTemplate = document.getElementById('task-template');
const newTaskForm = document.querySelector('[data-new-task-form]');
const newTaskInput = document.querySelector('[data-new-task-input]');
const clearCompleteTaskButton = document.querySelector('[data-clear-complete-task-button]');
const modalModifySubmitButton = document.querySelector('[data-modal-modify-submit-button]');

// Local storage setup
const LOCAL_STORAGE_TASK_KEY = 'tasks';
const LOCAL_STORAGE_LIST_KEY = 'task.list';
const LOCAL_STORAGE_LIST_ID_KEY = 'task.selectedListId';
const LOCAL_STORAGE_TASK_ID_KEY = 'task.selectedTaskId';

let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || []
let tasks = JSON.parse(localStorage.getItem(LOCAL_STORAGE_TASK_KEY)) || []
let selectedListId = localStorage.getItem(LOCAL_STORAGE_LIST_ID_KEY);
let selectedTaskId = localStorage.getItem(LOCAL_STORAGE_TASK_ID_KEY);

const flatArray = [];


listContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'li') {
        selectedListId = e.target.dataset.listId;
        saveAndRender();
    }
});

if (selectedListId != null) {
    // listDisplayContainer.style.display = 'none'
    tasksContainer.addEventListener('click', e => {
        if (e.target.tagName.toLowerCase() === 'input') {
            const selectedList = lists.find(list => list.id === selectedListId);
            const selectedTask = selectedList.tasks.find(task => task.id === e.target.id);
            selectedTask.complete = e.target.checked;
            if (selectedTask.complete) {
                e.target.parentNode.childNodes[3].classList.add('complete-task');
            } else {
                e.target.parentNode.childNodes[3].classList.remove('complete-task');
            }

            saveToLocalStorage();
            renderTaskCount(selectedList);
        } else if (e.target.tagName.toLowerCase() === 'i' && e.target.hasAttribute('data-expand-task')) {
            const taskActionsDiv = e.target.parentNode.nextElementSibling;

            if (taskActionsDiv.classList.contains('hide-task-actions')) {
                taskActionsDiv.classList.remove('hide-task-actions');
                taskActionsDiv.classList.add('show-task-actions');
            } else {
                taskActionsDiv.classList.add('hide-task-actions');
                taskActionsDiv.classList.remove('show-task-actions');
            }
        } else if (e.target.tagName.toLowerCase() === 'i' && e.target.classList.contains('task-action-icon')) {
            const selectedList = lists.find(list => list.id === selectedListId);
            const selectedTask = selectedList.tasks.find(task => task.id === e.target.parentNode.id);
            selectedTaskId = selectedTask.id;
            // Get modal
            if (e.target.hasAttribute('data-task-info-action-icon')) {
                const modalTaskDetailsTitle = document.querySelector('[data-modal-task-details-title]');
                const modalTaskDetailsText = document.querySelector('[data-modal-task-details-text');
                modalTaskDetailsTitle.innerHTML = selectedTask.name;
                if (selectedTask.description) modalTaskDetailsText.innerHTML = selectedTask.description;
            } else if (e.target.hasAttribute('data-task-modify-action-icon')) {
                const modalModifyNameInput = document.querySelector('[data-modal-modify-name-input]');
                const modalModifyDescriptionInput = document.querySelector('[data-modal-modify-description-input]');

                if (selectedTask.description) modalModifyDescriptionInput.value = selectedTask.description;
                modalModifyNameInput.value = selectedTask.name;
            }
        }
    })
}

// Modify Task Details
modalModifySubmitButton.addEventListener('click', e => {
    e.preventDefault();
    const modalModifyNameInput = document.querySelector('[data-modal-modify-name-input]');
    const modalModifyDescriptionInput = document.querySelector('[data-modal-modify-description-input]');
    const selectedList = lists.find(list => list.id === selectedListId);
    const selectedTask = selectedList.tasks.find(task => task.id === selectedTaskId);
    selectedTask.name = modalModifyNameInput.value;
    selectedTask.description = modalModifyDescriptionInput.value;

    if (selectedTask.name === modalModifyNameInput.value && selectedTask.description === modalModifyDescriptionInput.value) {
        saveAndRender();
        modalModifyNameInput.value = "";
        modalModifyDescriptionInput.value = "";
        var elem = document.querySelector('#modalModifyTask');
        var instance = M.Modal.getInstance(elem);
        instance.close();
        M.toast({
            html: 'Task Details Modified', classes: 'rounded teal teal-lighten-2'
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems);
});

newListForm.addEventListener('submit', e => {
    e.preventDefault();
    // get input value
    const listName = newListInput.value;
    // validate input value
    if (listName === '' || listName == null) return
    // create new list
    const list = createList(listName);
    // clear input value
    newListInput.value = null;
    // add new list to lists array
    lists.push(list);
    tasks.push(list);
    // re-render 
    saveAndRender();
});


if (selectedListId != null) {
    newTaskForm.addEventListener('submit', e => {
        e.preventDefault();
        // get input value
        const taskName = newTaskInput.value;
        // validate input value
        if (taskName === '' || taskName == null) return
        // create new list
        const task = createTask(taskName);
        // clear input value
        newTaskInput.value = null;
        // add new list to lists array
        const selectedList = lists.find(list => list.id === selectedListId);
        selectedList.tasks.push(task);
        tasks.push(task)
        // re-render 
        saveAndRender();
    });
}

deleteListButton.addEventListener('click', e => {
    lists = lists.filter(list => list.id !== selectedListId);
    selectedListId = 'null';
    selectedTaskId = 'null';
    saveAndRender();
});

clearCompleteTaskButton.addEventListener('click', e => {
    const selectedList = lists.find(list => list.id === selectedListId);
    selectedList.tasks = selectedList.tasks.filter(task => !task.complete);
    selectedListId = 'null';
    selectedTaskId = 'null';
    saveAndRender();
})

function createList(name) {
    // return new list object
    return {
        id: Date.now().toString(),
        name: name,
        parent: 0,
        tasks: [],
        complete: false
    }
}

function createTask(name) {
    return {
        id: Date.now().toString(),
        name: name,
        parent: selectedListId,
        tasks: [],
        complete: false
    }
}

function saveToLocalStorage() {
    tasks = flatArray;
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists));
    localStorage.setItem(LOCAL_STORAGE_TASK_KEY, JSON.stringify(tasks));
    localStorage.setItem(LOCAL_STORAGE_LIST_ID_KEY, selectedListId);
    localStorage.setItem(LOCAL_STORAGE_TASK_ID_KEY, selectedTaskId);
}

function saveAndRender() {
    saveToLocalStorage();
    render();
}

function render() {
    // clear list container
    clearElement(listContainer);
    // populate DOM with list elements
    renderLists();

    const selectedList = lists.find(list => list.id === selectedListId);

    if (selectedListId == 'null' || selectedList == null) {
        // listDisplayContainer.style.display = 'none'
        listDisplayContainer.classList.add('display-none');
    } else {
        listDisplayContainer.classList.remove('display-none');
        listTitleElement.innerText = selectedList.name;
        renderTaskCount(selectedList);
        clearElement(tasksContainer);
        renderTasks(selectedList);
    }
}

function renderTasks(selectedList) {
    selectedList.tasks.forEach(task => {
        const taskElement = document.importNode(taskTemplate.content, true);
        const checkbox = taskElement.querySelector('input');
        checkbox.id = task.id;
        checkbox.checked = task.complete;
        const label = taskElement.querySelector('label');
        label.htmlFor = task.id
        const taskName = taskElement.querySelector('[data-task-name]');
        taskName.innerText = task.name;
        const taskActions = taskElement.querySelector('[data-task-actions]');
        taskActions.setAttribute('id', task.id);

        tasksContainer.appendChild(taskElement);
    })
}

function renderTaskCount(selectedList) {
    const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length;
    const taskString = incompleteTaskCount === 1 ? 'task' : 'tasks';
    listCountElement.innerText = `${incompleteTaskCount} ${taskString} remaining`;
    listCountElement.style.display = ''
}

function renderLists() {
    lists.forEach(list => {
        // create a new li element
        const listElement = document.createElement('li');
        // add listID data attribute
        listElement.dataset.listId = list.id;
        // add list class name
        listElement.classList.add('list-name');
        // add list name to element
        listElement.innerHTML = list.name;
        // check for active list class
        if (list.id === selectedListId) {
            listElement.classList.add('active-list');
        }

        // append list to listcontainer
        listContainer.appendChild(listElement);
    })
}

function clearElement(element) {
    // check for child element and remove all
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function flattenArray(array) {
    array.forEach(element => {
        flatArray.push(element)
        if (Array.isArray(element.tasks)) {
            if (element.tasks.length > 0) {
                flattenArray(element.tasks);
            }
        }
    })
}

function getTaskById(id) {
    let taskData;
    tasks.map(task => {
        if (task.id == id) {
            taskData = task;
        }
    });

    return taskData;
}

function getTasksByParentId(id) {
    const arr = [];
    tasks.map(task => {
        if (task.parent == id) {
            arr.push(task);
        }
    });
    return arr;
}

function getParentByTaskId(id) {
    let parent;
    tasks.map(task => {
        if (task.id == id) {
            parent = getTaskById(task.parent);
        }
    });
    return parent;
}

function getAllChildTask() {
    const arr = [];
    tasks.map(task => {
        if (task.parent !== 0 || task.parent !== 0) {
            arr.push(task);
        }
    });
    return arr;
}

render();
// flattenArray(lists);




