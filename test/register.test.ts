import { field, Level } from "@coder/logger"
import { JSDOM } from "jsdom"

const loggerModule = {
  field,
  level: Level.Info,
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    trace: jest.fn(),
    warn: jest.fn(),
  },
}

describe("register", () => {
  const { window } = new JSDOM()
  global.window = (window as unknown) as Window & typeof globalThis
  global.document = window.document
  global.navigator = window.navigator
  global.location = window.location

  let spy: jest.SpyInstance

  beforeAll(() => {
    Object.defineProperty(global.navigator, "serviceWorker", {
      value: {
        register: () => {
          return "hello"
        },
      },
    })
  })

  beforeEach(() => {
    jest.mock("@coder/logger", () => loggerModule)
    spy = jest.spyOn(global.navigator.serviceWorker, "register")
  })

  afterEach(() => {
    jest.resetModules()
    jest.resetAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it("should register a ServiceWorker", () => {
    // Load service worker like you would in the browser
    require("../src/browser/register")
    // Load service worker like you would in the browser
    // expect spy to have been called
    expect(spy).toHaveBeenCalled()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it("should log an error if something doesn't work", () => {
    const message = "Can't find browser"
    const error = new Error(message)
    global.navigator.serviceWorker.register = () => {
      throw error
    }

    // Load service worker like you would in the browser
    require("../src/browser/register")

    expect(loggerModule.logger.error).toHaveBeenCalled()
    expect(loggerModule.logger.error).toHaveBeenCalledTimes(1)
    // Because we use logError, it will log the prefix along with the error message
    expect(loggerModule.logger.error).toHaveBeenCalledWith(`[Service Worker] registration: ${error.message} ${error.stack}`)
  })
})
