export class InputManager {
  private keyState: { [key: string]: boolean } = {};
  private static instance: InputManager;

  private constructor() {
    window.addEventListener('keydown', (e) => this.handleKeyEvent(e, true));
    window.addEventListener('keyup', (e) => this.handleKeyEvent(e, false));
    // 마우스 이벤트 리스너도 필요에 따라 여기에 추가
    // window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    // window.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    // window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
  }

  public static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }

  private handleKeyEvent(event: KeyboardEvent, isPressed: boolean): void {
    this.keyState[event.key.toLowerCase()] = isPressed;
    this.keyState[`key_${event.code.toLowerCase()}`] = isPressed; // 예: "key_arrowleft"
  }

  // 특정 키가 눌렸는지 확인하는 메소드
  public isKeyPressed(key: string): boolean {
    return !!this.keyState[key.toLowerCase()];
  }

  // (선택 사항) 마우스 위치 및 버튼 상태 관리
  // public getMousePosition(): { x: number; y: number } { /* ... */ }
  // public isMouseButtonPressed(button: number): boolean { /* ... */ }

  // 게임 루프가 끝날 때 또는 필요에 따라 호출하여 상태를 초기화 (예: 'justPressed' 상태 관리 시)
  // public reset(): void { /* ... */ }

  public destroy(): void {
    window.removeEventListener('keydown', (e) => this.handleKeyEvent(e, true));
    window.removeEventListener('keyup', (e) => this.handleKeyEvent(e, false));
    // 다른 이벤트 리스너들도 제거
  }
}
