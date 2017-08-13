import React from 'react';
import AddFishForm from './AddFishForm';
import base from '../base';

class Inventory extends React.Component {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.authenticate = this.authenticate.bind(this);
    this.logout = this.logout.bind(this);
    this.authHandler = this.authHandler.bind(this);
    this.renderLogin = this.renderLogin.bind(this);
    this.state = {
      uid: null,
      owner: null
    };
  }

  componentDidMount() {
    // Listen for authentications
    base.onAuth((user) => {
      if (user) {
        this.authHandler(null, {user});
      }
    });
  }

  handleChange(e, key) {
    const fish = this.props.fishes[key];

    // Take copy of fish and update it
    const updatedFish = {...fish,
      [e.target.name]: e.target.value // Computed value based on what actually changed
    };

    this.props.updateFish(key, updatedFish);
  }

  authenticate(provider) {
    base.authWithOAuthPopup(provider, this.authHandler);
  }

  logout() {
    base.unauth();
    this.setState({ uid: null });
  }

  authHandler(err, authData) {
    if (err) {
      console.error(err);
      return;
    }

    // Grab store info
    const storeRef = base.database().ref(this.props.storeId);

    // Query firebsae once for the store data
    storeRef.once('value', (snapshot) => {
      const data = snapshot.val() || {};

      // Claim as own if no owner
      if (!data.owner) {
        storeRef.set({
          owner: authData.user.uid
        });
      }

      this.setState({
        uid: authData.user.uid,
        owner: data.owner || authData.user.uid
      });
    });
  }

  renderLogin() {
    return (
      <nav className="login">
        <h2>Inventory</h2>
        <p>Sign in to manage your store's inventory</p>
        <button className="github" onClick={() => this.authenticate('github')}>Login with GitHub</button>
        <button className="facebook" onClick={() => this.authenticate('facebook')}>Login with Facebook</button>
        <button className="twitter" onClick={() => this.authenticate('twitter')}>Login with Twitter</button>
      </nav>
    );
  }

  renderInventory(key) {
    const fish = this.props.fishes[key];
    return (
      <div className="fish-edit" key={key}>
        <input onChange={(e) => this.handleChange(e, key)} type="text" name="name" placeholder="Name" value={fish.name} />
        <input onChange={(e) => this.handleChange(e, key)} type="text" name="price" placeholder="Price" value={fish.price} />
        <select onChange={(e) => this.handleChange(e, key)} name="status" value={fish.status}>
          <option value="available">Fresh</option>
          <option value="unavailable">Sold Out</option>
        </select>
        <textarea onChange={(e) => this.handleChange(e, key)} type="text" name="desc" placeholder="Description" value={fish.desc}></textarea>
        <input onChange={(e) => this.handleChange(e, key)} type="text" name="image" placeholder="Image" value={fish.image} />
        <button onClick={() => this.props.removeFish(key)}>Remove Fish</button>
      </div>
    );
  }

  render() {
    const logout = <button onClick={this.logout}>Log Out</button>;
    // Check if not logged in
    if (!this.state.uid) {
      return (
        <div>{this.renderLogin()}</div>
      );
    }

    // Check if they are the owner
    if (this.state.uid !== this.state.owner) {
      return (
        <div>
          <p>Sorry, you aren't the owner of the store.</p>
          {logout}
        </div>
      );
    }

    return (
      <div>
          <h2>Inventory</h2>
          {logout}
          {Object.keys(this.props.fishes).map(this.renderInventory.bind(this))}
          <AddFishForm addFish={this.props.addFish} />
          <button onClick={this.props.loadSamples}>Load Sample Fishes</button>
      </div>      
    );
  }
}

Inventory.propTypes = {
  fishes: React.PropTypes.object.isRequired,
  addFish: React.PropTypes.func.isRequired,
  updateFish: React.PropTypes.func.isRequired,
  removeFish: React.PropTypes.func.isRequired,
  loadSamples: React.PropTypes.func.isRequired,
  storeId: React.PropTypes.string.isRequired
};

export default Inventory;