!function() {
  const d = document;
  const localStorageKey = 'todoList';
  const todoList = d.getElementById('todoList');
  let listArray = [];
  let itemCounter = 0;

  const todoItemObj = () => {
    return {
      content: '',
      status: 'incomplete',
      key: '',
    };
  }

  const todoStatus = Object.freeze([
    {
      status:    'complete',
      listClass: 'completed',
      btnLabel:  'Incomplete',
      btnClass:  'btn-warning',
    },
    {
      status:    'incomplete',
      listClass: 'uncompleted',
      btnLabel:  'Complete',
      btnClass:  'btn-success',
    },
  ]);

  const createTodoItem = ({content, status, key}) => {
    const statusObj = todoStatus.filter((data) => data.status === status)[0];
    const item      = d.createElement('li');
    const updateBtn = d.createElement('button');
    const removeBtn = d.createElement('button');

    item.key = key;
    item.status = status;
    item.classList.add('well', statusObj.listClass);
    item.innerHTML = `<label>${content}</label>`;

    updateBtn.classList.add('btn', 'mr-2', statusObj.btnClass);
    updateBtn.innerHTML = statusObj.btnLabel;

    removeBtn.className = 'btn btn-danger'
    removeBtn.innerHTML = '<i class="fas fa-trash"></i>';

    updateBtn.addEventListener('click', (e) => {
      const updateBtn = e.currentTarget;
      changeItemStatus({item, updateBtn});
    });
    removeBtn.addEventListener('click', () => removeItem(item));

    item.appendChild(updateBtn);
    item.appendChild(removeBtn);

    return item;
  }

  const addItem = () => {
    console.log('> ADD Item');
    const input = d.getElementById('itemInput');
    const newItem = todoItemObj();
    newItem.content = input.value.replace(/<\/?[^>]+(>|$)/g, "");
    newItem.status = 'incomplete';
    newItem.key = itemCounter;
    const item = createTodoItem(newItem);

    // add item to data
    addItemToList(newItem);

    todoList.appendChild(item);
    input.value = '';
    input.focus();
    console.log(item, item.key, item.status);
  }

  const changeItemStatus = ({item, updateBtn}) => {
    console.log('> Change Status', item.status, item);
    const updateItemKey = item.key;
    const status = todoStatus.slice();
    const isComplete = item.status === 'complete';
    if( isComplete ) { status.reverse(); }
    const [newStatus, oldStatus] = status;

    // update data item
    updateItemStatus(updateItemKey)(newStatus.status);

    item.status = newStatus.status;
    item.classList.replace(oldStatus.listClass, newStatus.listClass);
    updateBtn.classList.replace(oldStatus.btnClass, newStatus.btnClass);
    updateBtn.textContent = newStatus.btnLabel;
  }

  const removeItem = (item) => {
    console.log('> REMOVE Item', item.key, item);
    removeItemFromList( item.key - 0 );
    item.parentElement.removeChild(item);
  }

  const addItemToList = (item) => {
    const todos = listArray.slice();
    todos.push(item);
    itemCounter += 1;
    refreshLocalStorage( todos );
  }

  const updateItemStatus = (key) => (status) => {
    const todos = listArray.slice();
    todos.some((data) => {
      if (data.key === key) {
        data.status = status;
        return true;
      }
    });
    refreshLocalStorage( todos );
  }

  const removeItemFromList = (key) => {
    const todos = listArray.filter((data) => data.key !== key);
    refreshLocalStorage(todos);
  }

  const refreshLocalStorage = (data) => {
    // shallow copy & update
    listArray = data.slice();
    // replace
    localStorage.setItem(localStorageKey, JSON.stringify(data));
    console.log('listArray\n', listArray);
  }

  const clearList = () => {
    listArray.length = 0;
    localStorage.removeItem('todoList');
    todoList.innerHTML = '';
  }

  // add EventListener
  const init = () => {
    // id属性で直接アクセス可能だが、一応 getElementById しておく
    const addButton = d.getElementById('addButton');
    const clearButton = d.getElementById('clearButton');

    addButton.addEventListener('click', addItem);
    clearButton.addEventListener('click', clearList);
  }

  window.onload = () => {
    const listData = localStorage.getItem(localStorageKey);
    if (listData !== null) {
      const fragment = d.createDocumentFragment();
      const todos = JSON.parse(listData).map((data, i) => {
        // 読込み時に key を index に書き換える
        data.key = i;
        fragment.appendChild( createTodoItem(data) );
        return data;
      });
      refreshLocalStorage(todos);
      itemCounter = listArray.length;
      todoList.appendChild(fragment);
    }

    init();
  }
}();
