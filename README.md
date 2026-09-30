# Expense Tracker

A responsive expense tracker application built with React, TypeScript, and Vite.

The application allows users to add and view expenses, calculate total spending, load initial data from a mock API, and persist expenses in the browser using local storage.

## Features

- Add expenses with a description, amount, category, and date
- Display expenses in a responsive list
- Calculate total expenses and transaction count
- Load initial expenses from a local mock API
- Persist expenses in `localStorage`
- Restore expenses after page refresh
- Automatic focus on the description field after submitting a new expense
- Loading and error states
- Responsive layout for desktop and mobile devices

## React Concepts

This project demonstrates the following React hooks:

- `useState` — manages form inputs, expenses, loading state, and error state
- `useEffect` — loads initial expenses and synchronizes expense data with local storage
- `useRef` — manages focus for the description input
- `useMemo` — calculates the total expense amount
- `useCallback` — memoizes the expense creation handler

## Tech Stack

- React
- TypeScript
- Vite
- CSS
- ESLint
- Prettier
- Browser `localStorage`

## Project Structure

```text
src/
├── api/
│   └── expenses.ts
├── components/
│   ├── ExpenseForm/
│   │   └── ExpenseForm.tsx
│   ├── ExpenseItem/
│   │   └── ExpenseItem.tsx
│   ├── ExpenseList/
│   │   └── ExpenseList.tsx
│   └── ExpenseSummary/
│       └── ExpenseSummary.tsx
├── types/
│   └── expense.ts
├── utils/
│   └── storage.ts
├── App.css
├── App.tsx
├── index.css
└── main.tsx
````

## Getting Started

### Prerequisites

* Node.js
* npm

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/mykytapilec/expense-tracker-web.git
cd expense-tracker-web
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at the local URL provided by Vite.

### Linting

Run ESLint:

```bash
npm run lint
```

### Production Build

Create a production build:

```bash
npm run build
```

## Data Persistence

Initial expenses are provided by a local mock API.

After the data is loaded, expenses are stored in the browser's `localStorage`. New expenses are also persisted automatically, so they remain available after refreshing the page.

The stored data belongs to the current browser and is not synchronized with a remote backend.

## Mock API

The project uses a local mock API instead of a real backend.

The mock API simulates asynchronous data loading and provides the initial expense data used by the application.

## Development Workflow

The project follows a feature-branch Git workflow:

```text
main
  └── dev
       ├── feature/project-setup
       ├── feature/expense-form
       ├── feature/expense-list
       ├── feature/mock-api
       ├── feature/expense-summary
       ├── feature/use-callback
       ├── feature/project-polish
       ├── feature/local-storage
       └── feature/project-documentation
```

Feature branches are created from `dev` and merged back through pull requests.

## Project Requirements

This project was created to practice:

* React state management with `useState`
* Asynchronous data loading with `useEffect`
* DOM references with `useRef`
* Performance optimization with `useMemo`
* Callback memoization with `useCallback`
* TypeScript type safety
* Responsive UI development