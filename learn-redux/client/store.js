import { createStore, compose } from 'redux';
import { syncHistoryWithStore } from 'react-router-redux';
import { browserHistory } from 'react-router';

// Import the root reducer
import rootReducer from './reducers/index';

// Import sample data
import comments from './data/comments';
import posts from './data/posts';

// Create an object for default data
const defaultState = {
  posts,
  comments
}

// Create redux store
const store = createStore(rootReducer, defaultState);

export const history = syncHistoryWithStore(browserHistory, store);

export default store;