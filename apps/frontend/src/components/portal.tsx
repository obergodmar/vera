import React, {
  forwardRef,
  HTMLAttributes,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';

export type PortalProps = {
  /**
   * В некоторых случаях необходимо добавить класс на элемент,
   * в котором будут рендериться дочерние элементы.
   * Например, для передачи custom properties
   */
  portalClassName?: string;

  /**
   * Элемент, в конец которого будет портировано содержимое.
   * Если portalTarget не указан, элемент отправляется в body
   *
   * null предполагает назначение таргета в дальнейшем и
   * позволяет дождаться его рендеринга
   */
  portalTarget?: HTMLElement | null;
} & React.PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

/**
 * Portal
 * Отправляет `children` в отдельный `div` в конце `body`.
 * При анмаунте, удаляет за собой созданный `div`
 */
export const Portal = forwardRef<HTMLDivElement | null, PortalProps>(
  function WithPortal(
    { children, portalClassName, portalTarget, ...props },
    ref
  ) {
    const [renderNode, setRenderNode] = useState<HTMLDivElement | null>(null);
    const prevClassName = usePrevious<string | undefined>(portalClassName);

    /**
     * Поддерживаем актуальный класс на дом-ноде
     */
    useEffect(() => {
      if (!renderNode) {
        return;
      }

      if (prevClassName) {
        renderNode.classList.remove(...prevClassName.split(' '));
      }

      if (portalClassName) {
        renderNode.classList.add(...portalClassName.split(' '));
      }
    }, [renderNode, portalClassName, prevClassName]);

    /**
     * Не забываем удалить за собой дом-ноду при анмаунте
     */
    useLayoutEffect(() => {
      /* Ждём назначения элмента */
      if (portalTarget === null) {
        return;
      }

      const nodeEl = node(portalClassName, portalTarget);
      setRenderNode(nodeEl);

      return () => {
        nodeEl.remove();
      };
      /**
       * Не прописываем в зависимостях portalClassName,
       * потому что актуальность класса поддерживается в другом хуке
       */
    }, [portalTarget]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!renderNode) {
      return null;
    }

    return ReactDOM.createPortal(
      <div {...props} ref={ref}>
        {children}
      </div>,
      renderNode
    );
  }
);

/**
 * Создаёт div для портала
 */
function node(className?: string, portalTarget?: HTMLElement): HTMLDivElement {
  const el = document.createElement('div');
  if (className) {
    el.classList.add(...className.split(' '));
  }

  return (portalTarget || document.body).appendChild(el);
}

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
