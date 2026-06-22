export function CheckIcon({ size = 14, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      className={`status-icon status-icon-pass ${className}`}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"
      />
    </svg>
  );
}

export function CrossIcon({ size = 14, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      className={`status-icon status-icon-fail ${className}`}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M256-200 200-256l224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"
      />
    </svg>
  );
}
export function CveIcon({ size = 14, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      className={`status-icon ${className}`}
    >
      <path
        fill="currentColor"
        d="M480-80 280-280h120v-240H240L480-880l240 360H560v240h120L480-80Z"
      />
    </svg>
  );
}

export function PackageIcon({ size = 14, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      className={`status-icon ${className}`}
    >
      <path
        fill="currentColor"
        d="m480-80-320-184v-368l320-184 320 184v368L480-80Zm0-92 240-138v-276L480-724 240-586v276l240 138Z"
      />
    </svg>
  );
}

export function SeverityIcon({ severity, size = 14, className = "" }) {
  const colorClass = `severity-${(severity || "low").toLowerCase()}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      className={`status-icon ${colorClass} ${className}`}
    >
      <path
        fill="currentColor"
        d="M80-80v-80l720-720h80v80L160-80H80Zm560-320L400-640l56-56 184 184-56 56Z"
      />
    </svg>
  );
}