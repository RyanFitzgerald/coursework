import React from 'react';
import AddFishForm from './AddFishForm';

class Inventory extends React.Component {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e, key) {
    const fish = this.props.fishes[key];

    // Take copy of fish and update it
    const updatedFish = {...fish,
      [e.target.name]: e.target.value // Computed value based on what actually changed
    };

    this.props.updateFish(key, updatedFish);
  }

  renderInventory(key) {
    const fish = this.props.fishes[key]
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
      </div>
    )
  }

  render() {
    return (
      <div>
          <h2>Inventory</h2>
          {Object.keys(this.props.fishes).map(this.renderInventory.bind(this))}
          <AddFishForm addFish={this.props.addFish} />
          <button onClick={this.props.loadSamples}>Load Sample Fishes</button>
      </div>      
    );
  }
}

export default Inventory;