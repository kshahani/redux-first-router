import { setupAll } from '../__test-helpers__/setup'
import setupThunk from '../__test-helpers__/setupThunk'
import redirect from '../src/actions/redirect'

it('calls handler on route change -- global', async () => {
  const onComplete = jest.fn()
  const { store } = await setupAll('/first', { onComplete })

  const action = { type: 'SECOND', params: { param: 'bar' } }
  await store.dispatch(action)

  expect(store.getState().location.type).toEqual('SECOND')

  expect(onComplete).toHaveBeenCalled()
  expect(onComplete.mock.calls[1][0].action).toMatchObject(action)
  expect(onComplete.mock.calls[1][0].arg).toEqual('extra-arg')
})

it('calls handler on route change -- route', async () => {
  const onComplete = jest.fn()

  const routesMap = {
    FIRST: '/first',
    SECOND: {
      path: '/second',
      onComplete
    },
    THIRD: '/third'
  }

  const { store } = await setupAll('/first', undefined, { routesMap })
  const action = { type: 'SECOND' }
  await store.dispatch(action)

  expect(store.getState().location.type).toEqual('SECOND')

  expect(onComplete).toHaveBeenCalled()
  expect(onComplete.mock.calls[0][0].action).toMatchObject(action)
  expect(onComplete.mock.calls[0][0].arg).toEqual('extra-arg')
})


it('skips onComplete on redirect', async () => {
  const redirectAction = { type: 'THIRD', params: { param: 'bar' } }
  const thunk = jest.fn(({ dispatch }) => {
    return dispatch({ ...redirectAction })
  })
  const onComplete = jest.fn()

  const { store } = await setupThunk('/first', thunk, { onComplete })
  await store.dispatch({ type: 'SECOND', params: { param: 'bar' } })

  const { location } = store.getState()

  expect(location).toMatchObject(redirectAction)
  expect(onComplete).toHaveBeenCalled()
  expect(onComplete.mock.calls.length).toEqual(2) // would otherwise be called 3x if onComplete from SECOND route was not skipped
})
