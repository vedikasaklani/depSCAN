import "./DataTableCard.css";

export default function DataTableCard({
  id,
  title,
  meta,
  children,
  footer,
  className = "",
  headerClassName = "",
  titleClassName = "",
  metaClassName = "",
  scrollClassName = "",
  tableId,
  tableClassName = "",
}) {
  return (
    <section id={id} className={`app-data-table-card ${className}`.trim()}>
      <header className={`app-data-table-header ${headerClassName}`.trim()}>
        <h2 className={`app-data-table-title ${titleClassName}`.trim()}>{title}</h2>
        {meta && <div className={`app-data-table-meta ${metaClassName}`.trim()}>{meta}</div>}
      </header>

      <div className={`app-data-table-scroll ${scrollClassName}`.trim()}>
        <table id={tableId} className={`app-data-table ${tableClassName}`.trim()}>
          {children}
        </table>
      </div>

      {footer && <footer className="app-data-table-footer">{footer}</footer>}
    </section>
  );
}
