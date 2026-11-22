import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import PawIcon from './PawIcon';
import type { Photo } from '../lib/photos';
import { stepIndex, swipeDirection } from '../lib/viewer';
import { NEMO } from '../lib/nemo';

interface Props {
  photos: Photo[];
  /** The photo to show, or null when the viewer is closed. */
  index: number | null;
  onChange: (index: number) => void;
  onClose: () => void;
}

/**
 * Full-screen photo viewer. Swipe, use the ‹ › buttons or the arrow keys to move
 * between photos; close with ✕ or Esc.
 * Built on the native <dialog> element, so focus and screen readers are handled.
 */
export default function PhotoViewer({ photos, index, onChange, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const open = index !== null;
  const photo = open ? photos[index] : null;

  // Open and close the dialog, and stop the page behind it from scrolling.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      openerRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Runs however the viewer closes (✕, Esc): unlock scrolling and return focus to the thumbnail.
  const handleClose = () => {
    document.body.style.overflow = '';
    openerRef.current?.focus();
    onClose();
  };

  const go = (step: number) => {
    if (index !== null) onChange(stepIndex(index, step, photos.length));
  };

  // Load the next and previous photos in the background so moving between them feels instant.
  useEffect(() => {
    if (index === null || !navigator.onLine) return;
    for (const step of [1, -1]) {
      const neighbor = photos[stepIndex(index, step, photos.length)];
      const img = new Image();
      img.sizes = '100vw';
      img.srcset = neighbor.srcSet;
      img.src = neighbor.src;
    }
  }, [index, photos]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') go(1);
    else if (event.key === 'ArrowLeft') go(-1);
  };

  const onPointerDown = (event: PointerEvent) => {
    swipeStart.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: PointerEvent) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const direction = swipeDirection(event.clientX - start.x, event.clientY - start.y);
    if (direction === 'next') go(1);
    else if (direction === 'previous') go(-1);
  };

  const alt = photo?.caption ?? `A photo of ${NEMO.name}`;

  return (
    <dialog
      ref={dialogRef}
      className="viewer"
      aria-label={photo && index !== null ? `Photo ${index + 1} of ${photos.length}: ${alt}` : 'Photo viewer'}
      onClose={handleClose}
      onKeyDown={onKeyDown}
    >
      {photo && index !== null && (
        <div className="viewer-layout">
          <div className="viewer-bar">
            <span className="viewer-count" aria-live="polite">
              {index + 1} of {photos.length}
            </span>
            <button type="button" className="viewer-close" onClick={() => dialogRef.current?.close()} aria-label="Close photo">
              ✕
            </button>
          </div>

          <div
            className="viewer-stage"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              swipeStart.current = null;
            }}
          >
            {failedSrc === photo.src ? (
              <div className="viewer-unavailable" role="status">
                <span className="icon-bubble"><PawIcon size={20} /></span>
                <p>This photo will appear when you're back online.</p>
              </div>
            ) : (
              <img
                key={photo.src}
                className={loadedSrc === photo.src ? 'viewer-img' : 'viewer-img viewer-img-loading'}
                src={photo.src}
                srcSet={photo.srcSet}
                sizes="100vw"
                width={photo.width}
                height={photo.height}
                alt={alt}
                draggable={false}
                ref={(img) => {
                  if (img?.complete && img.naturalWidth > 0) setLoadedSrc(photo.src);
                }}
                onLoad={() => setLoadedSrc(photo.src)}
                onError={() => setFailedSrc(photo.src)}
              />
            )}

            {photos.length > 1 && (
              <>
                <button type="button" className="viewer-nav viewer-prev" onClick={() => go(-1)} aria-label="Previous photo">
                  ‹
                </button>
                <button type="button" className="viewer-nav viewer-next" onClick={() => go(1)} aria-label="Next photo">
                  ›
                </button>
              </>
            )}
          </div>

          <p className="viewer-caption">{photo.caption ?? ' '}</p>
        </div>
      )}
    </dialog>
  );
}
