// Reducer takes: 1) the action and 2) copy of current state

// Comment reducer
function comments(state = [], action) { // Use defaults for state
  console.log(state, action);
  return state;
}

export default comments;