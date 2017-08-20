// Reducer takes: 1) the action and 2) copy of current state

// For individual comments
function postComments(state = [], action) { // Use defaults for state
  switch(action.type) {
    case 'ADD_COMMENT':
      // Return new state with new comment
      return [...state, {
        user: action.author,
        text: action.comment
      }];
    case 'REMOVE_COMMENT':
      // Return without deleted comment
      return [
        // From start to deleted one
        ...state.slice(0, action.i),
        // After deleted one
        ...state.slice(action.i + 1)
      ];
    default:
      return state;
  }
}

// Comment reducer
function comments(state = [], action) { // Use defaults for state
  if (typeof action.postId !== 'undefined') {
    return {
      // Take current state
      ...state,
      // Overwrite this post with new one
      [action.postId]: postComments(state[action.postId], action)
    }
  }

  return state;
}

export default comments;