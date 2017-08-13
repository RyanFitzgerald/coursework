import React from 'react';
import { getFunName } from '../helpers';

class StorePicker extends React.Component {
  // Bind via construct...can also do inline like below
  // constructor() {
  //     super();
  //     this.goToStore = this.goToStore.bind(this); // Bind custom function to StorePicker component
  // }

  goToStore(e) {
    e.preventDefault(); // Stop form submission

    // First grab the text from the box
    const storeId = this.storeInput.value;

    // Then transition to store url
    this.context.router.transitionTo(`/store/${storeId}`);
  }

  render() {
    return (
      <form className="store-selector" onSubmit={this.goToStore.bind(this)}>
        <h2>Please Enter A Store</h2>
        <input type="text" required placeholder="Store Name" defaultValue={getFunName()} ref={(input) => { this.storeInput = input }} />
        <button type="submit">Visit Store</button>
      </form>
    );
  }
}

// Surface the router (it will expect it)
StorePicker.contextTypes = {
    router: React.PropTypes.object
};

export default StorePicker;