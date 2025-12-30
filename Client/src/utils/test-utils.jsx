import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

// Mock reducer (simple version of your real root reducer)
// You might want to import your real store/reducers if possible, 
// but mocking ensures isolation.
const mockReducer = (state = { auth: { user: null, isAuthenticated: false } }, action) => state;

const customRender = (
         ui,
         {
                  preloadedState = {},
                  store = configureStore({ reducer: { auth: mockReducer }, preloadedState }),
                  ...renderOptions
         } = {}
) => {
         function Wrapper({ children }) {
                  return (
                           <Provider store={store}>
                                    <BrowserRouter>{children}</BrowserRouter>
                           </Provider>
                  );
         }
         return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

export * from '@testing-library/react';
export { customRender as render };
