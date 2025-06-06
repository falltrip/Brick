export class InputManager {
  private keyState: { [key: string]: boolean } = {};
  private static instance: InputManager;

  // 이벤트 핸들러를 바인딩된 메서드로 정의
  private boundHandleKeyDown: (e: KeyboardEvent) => void;
  private boundHandleKeyUp: (e: KeyboardEvent) => void;

  private constructor() {
    // 바인딩된 메서드를 이벤트 리스너로 등록
    this.boundHandleKeyDown = (e) => this.handleKeyEvent(e, true);
    this.boundHandleKeyUp = (e) => this.handleKeyEvent(e, false);

    window.addEventListener('keydown', this.boundHandleKeyDown);
    window.addEventListener('keyup', this.boundHandleKeyUp);
  }

  public static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }

  private handleKeyEvent(event: KeyboardEvent, isPressed: boolean): void {
    // event.key와 event.code를 모두 저장 (소문자로)
    this.keyState[event.key.toLowerCase()] = isPressed;
    this.keyState[event.code.toLowerCase()] = isPressed; // 'key_' 접두사 제거
  }

  // 특정 키가 눌렸는지 확인 (key 또는 code 값으로)
  public isKeyPressed(keyOrCode: string): boolean {
    return !!this.keyState[keyOrCode.toLowerCase()];
  }

  public destroy(): void {
    // 등록된 것과 동일한 참조의 핸들러를 제거
    window.removeEventListener('keydown', this.boundHandleKeyDown);
    window.removeEventListener('keyup', this.boundHandleKeyUp);
    // InputManager 인스턴스도 초기화하여 재사용 시 새롭게 생성하도록 함 (선택적)
    // InputManager.instance = null; // 싱글톤 패턴에 따라 필요 여부 결정
  }
}
