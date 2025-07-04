import React from 'react';
export default function lazyWithDelay(importFn, delay = 200) {
  return React.lazy(() =>
    Promise.all([
      importFn(),
      new Promise(resolve => setTimeout(resolve, delay)),
    ]).then(([module]) => module)
  )
}