import {Query} from 'react-apollo';
import gql from 'graphql-tag';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';

import {perPage} from '../config';

import PaginationStyles from './styles/PaginationStyles';

const PAGINATION_QUERY = gql`
  query PAGINATION_QUERY {
    itemsConnection {
      aggregate {
        count
      }
    }
  }
`;

const Pagination = (props) => {
  return (
    <Query query={PAGINATION_QUERY}>
        {({data, loading, error}) => {
          if (loading) return <p>Loading...</p>;
          
          const count = data.itemsConnection.aggregate.count;
          const pages = Math.ceil(count / perPage);
          const page = props.page;
          
          return (
            <PaginationStyles>
              <Head>
                <title>Sick Fits | Page {page} of {pages}</title>
              </Head>
              <Link 
                prefetch
                href={{
                  pathname: 'items',
                  query: {page: page - 1}
                }}
              >
                <a className="prev" aria-disabled={page <= 1}>&larr; Prev</a>
              </Link>
              <p>Page {page} of {pages}</p>
              <p>{count} Items Total</p>
              <Link 
                prefetch
                href={{
                  pathname: 'items',
                  query: {page: page + 1}
                }}
              >
                <a aria-disabled={page >= pages}>Next &rarr;</a>
              </Link>
            </PaginationStyles>
          );
        }}
      </Query>
  );
};

export default Pagination;