// Reducer takes: 1) the action and 2) copy of current state

// Post reducer
function posts(state = [], action) { // Use defaults for state
  console.log(state, action);
  return state;
}

export default posts;