import { adopt } from "react-adopt";
import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import React from "react";

import calcTotalPrice from "../lib/calcTotalPrice";
import formatMoney from "../lib/formatMoney";

import CartItem from "./CartItem";
import CartStyles from "./styles/CartStyles";
import CloseButton from "./styles/CloseButton";
import SickButton from "./styles/SickButton";
import Supreme from "./styles/Supreme";
import TakeMyMoney from "./TakeMyMoney";
import User from "./User";

const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`;

const TOGGLE_CART_MUTATION = gql`
  mutation {
    toggleCart @client
  }
`;

const Composed = adopt({
  user: ({ render }) => <User>{render}</User>, // Example of how to get rid of proptypes issue
  toggleCart: <Mutation mutation={TOGGLE_CART_MUTATION} />,
  localState: <Query query={LOCAL_STATE_QUERY} />,
});

const Cart = () => {
  return (
    <Composed>
      {({ user, toggleCart, localState }) => {
        const me = user.data.me;

        if (!me) return null;

        return (
          <CartStyles open={localState.data.cartOpen}>
            <header>
              <CloseButton title="close" onClick={toggleCart}>
                &times;
              </CloseButton>
              <Supreme>{me.name}'s Cart</Supreme>
              <p>You have {me.cart.length} Items in your cart.</p>
            </header>
            <ul>
              {me.cart.map(cartItem => (
                <CartItem key={cartItem.id} cartItem={cartItem} />
              ))}
            </ul>
            <footer>
              <p>{formatMoney(calcTotalPrice(me.cart))}</p>
              {me.cart.length && (
                <TakeMyMoney>
                  <SickButton>Checkout</SickButton>
                </TakeMyMoney>
              )}
            </footer>
          </CartStyles>
        );
      }}
    </Composed>
  );
};

export default Cart;
export { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION };
