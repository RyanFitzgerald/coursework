import {Mutation} from 'react-apollo';
import gql from 'graphql-tag';
import React, { Component } from 'react';
import Router from 'next/router';

import formatMoney from '../lib/formatMoney';

import Error from './ErrorMessage';
import Form from './styles/Form';

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
    createItem(
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id
    }
  }
`;

class CreateItem extends Component {
  state = {
    title: '',
    description: '',
    image: '',
    largeImage: '',
    price: 0
  };

  handleChange = (e) => {
    const {name, type, value} = e.target;
    const val = type === 'number' ? parseFloat(value) : value;
    this.setState({[name]: val});
  }

  render() {
    return (
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
        {(createItem, {loading, error}) => {
          return (
            <Form onSubmit={async (e) => {
              // Stop form submission
              e. preventDefault();

              // Call mutation
              const res = await createItem();

              // Change them to the single item page
              Router.push({
                pathname: '/item',
                query: {id: res.data.createItem.id}
              })
            }}>
              <h2>Sell an Item</h2>
              <Error error={error} />
              <fieldset disabled={loading} aria-busy={loading}>
                <label htmlFor="title">
                  Title
                  <input type="text" id="title" name="title" placeholder="title" value={this.state.title} onChange={this.handleChange} required/>
                </label>

                <label htmlFor="price">
                  Price
                  <input type="price" id="price" name="price" placeholder="price" value={this.state.price} onChange={this.handleChange} required/>
                </label>

                <label htmlFor="description">
                  Description
                  <textarea type="text" id="description" name="description" placeholder="description" value={this.state.description} onChange={this.handleChange} required/>
                </label>

                <button type="submit">Submit</button>
              </fieldset>
            </Form>
          )
        }}
      </Mutation>
     
    );
  }
}

export default CreateItem;
export {CREATE_ITEM_MUTATION};