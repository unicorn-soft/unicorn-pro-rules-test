// src/mocks/browser.js
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// 모든 핸들러를 사용하여 서비스 워커를 설정합니다.
export const worker = setupWorker(...handlers)
