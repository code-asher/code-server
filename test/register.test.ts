import { JSDOM } from "jsdom"
// Note: we need to import logger from the root
// because this is the logger used in logError in ../src/common/util
import { logger } from "../node_modules/@coder/logger"

describe("register", () => {
  const { window } = new JSDOM()
  global.window = (window as unknown) as Window & typeof globalThis
  global.document = window.document
  global.navigator = window.navigator
  global.location = window.location

  let spy: jest.SpyInstance
  let loggerSpy: jest.SpyInstance
  const mockRegisterFn = jest.fn(() => console.log("Mock register fn called"))

  beforeAll(() => {
    Object.defineProperty(global.navigator, "serviceWorker", {
      value: {
        register: mockRegisterFn,
      },
    })
  })

  beforeEach(() => {
    spy = jest.spyOn(global.navigator.serviceWorker, "register")
  })

  afterEach(() => {
    // jest.resetModules()
    // jest.resetAllMocks()
    // jest.clearAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it("should register a ServiceWorker", () => {
    spy = jest.spyOn(global.navigator.serviceWorker, "register")
    // Load service worker like you would in the browser
    require("../src/browser/register")
    // Load service worker like you would in the browser
    // expect spy to have been called
    expect(spy).toHaveBeenCalled()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it("should log an error if something doesn't work", () => {
    mockRegisterFn.mockImplementation(() => console.log("frick ya"))
    loggerSpy = jest.spyOn(logger, "error")
    const message = "Can't find browser"
    const error = new Error(message)
    global.navigator.serviceWorker.register = () => {
      console.log("errror here")
      throw error
    }
    console.log(global.navigator.serviceWorker.register.toString())
    spy = jest.spyOn(global.navigator.serviceWorker, "register")
    spy.mockResolvedValue(() => {
      throw error
    })

    // Load service worker like you would in the browser
    require("../src/browser/register")

    expect(loggerSpy).toHaveBeenCalled()
    expect(spy).toHaveBeenCalled()
    // expect(loggerSpy).toHaveBeenCalledTimes(1)
    // Because we use logError, it will log the prefix along with the error message
    // expect(loggerSpy).toHaveBeenCalledWith(`[Service Worker] registration: ${error.message} ${error.stack}`)
  })
})
