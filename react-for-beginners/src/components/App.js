import React from 'react';

import Header from './Header';
import Order from './Order';
import Inventory from './Inventory';
import Fish from './Fish';
import base from '../base';

// Import sample fishes
import sampleFishes from '../sample-fishes';

class App extends React.Component {
  constructor() {
    super(); // Needed to initialize Component for use

    // Bind it so it can be used
    this.addFish = this.addFish.bind(this);
    this.updateFish = this.updateFish.bind(this);
    this.removeFish = this.removeFish.bind(this);
    this.loadSamples = this.loadSamples.bind(this);
    this.addToOrder = this.addToOrder.bind(this);
    this.removeFromOrder = this.removeFromOrder.bind(this);

    // Initial states
    this.state = {
      fishes: {},
      order: {}
    };
  }

  componentWillMount() {
    // Sync state with firebase
    this.ref = base.syncState(`${this.props.params.storeId}/fishes`, {
      context: this,
      state: 'fishes'
    });

    // Check if there is any order in localStorage
    const localStorageRef = localStorage.getItem(`order-${this.props.params.storeId}`);

    if (localStorageRef) {
      // Update app component's order state
      this.setState({
        order: JSON.parse(localStorageRef)
      });
    }
  }

  componentWillUnmount() {
    // Remove firebase binding if you go to different component
    base.removeBinding(this.ref);
  }

  componentWillUpdate(nextProps, nextState) {
    localStorage.setItem(`order-${this.props.params.storeId}`, JSON.stringify(nextState.order));
  }

  addFish(fish) {
    // Update state
    const fishes = {...this.state.fishes}; // Make copy of current state (best practice)

    // Add in new fish
    const timestamp = Date.now();
    fishes[`fish-${timestamp}`] = fish;

    // Set state
    this.setState({ fishes });
  }

  updateFish(key, updatedFish) {
    const fishes = {...this.state.fishes};
    fishes[key] = updatedFish;
    this.setState({ fishes });
  }

  removeFish(key) {
    const fishes = {...this.state.fishes};
    fishes[key] = null; // Must delete this way for firebase
    this.setState({ fishes });
  }

  loadSamples() {
    this.setState({
      fishes: sampleFishes
    });
  }

  addToOrder(key) {
    // Copy state
    const order = {...this.state.order};

    // Update / add new number of fish ordered
    order[key] = order[key] + 1 || 1;

    // Update state
    this.setState({ order });
  }

  removeFromOrder(key) {
    const order = {...this.state.order};
    delete order[key]; // Can delete this way since this isnt hooked up to firebase
    this.setState({ order });
  }

  render() {
    return (
      <div className="catch-of-the-day">
        <div className="menu">
            <Header tagline="Fresh Seafood Market" />
            <ul className="list-of-fishes">
              {
                Object.keys(this.state.fishes).map(key => <Fish key={key} index={key} details={this.state.fishes[key]} addToOrder={this.addToOrder} />)
              }
            </ul>
        </div>
        <Order fishes={this.state.fishes} order={this.state.order} params={this.props.params} removeFromOrder={this.removeFromOrder} />
        <Inventory addFish={this.addFish} loadSamples={this.loadSamples} fishes={this.state.fishes} updateFish={this.updateFish} removeFish={this.removeFish} storeId={this.props.params.storeId} />
      </div>
    );
  }
}

App.propTypes = {
  params: React.PropTypes.object.isRequired,
};

export default App;