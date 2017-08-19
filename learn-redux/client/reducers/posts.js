// Reducer takes: 1) the action and 2) copy of current state

// Post reducer
function posts(state = [], action) { // Use defaults for state
  switch(action.type) {
    case 'INCREMENT_LIKES':
      const i = action.index;
      return [
        ...state.slice(0,i), // Before updated one
        {...state[i], likes: state[i].likes + 1},
        ...state.slice(i+1) // After updated one
      ];
    default:
      return state;
  }
}

export default posts;