import { PDFViewer, PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { EVENT_TYPES } from '../../utils/constants';
import Card from '../ui/Card';
import Button from '../ui/Button';

// ==========================================
// FONT — Helvetica is built-in (Arial equivalent)
// ==========================================

// ==========================================
// COLOR PALETTE (from guide)
// ==========================================
const C = {
    navy: '#1A1A2E',
    lightBg: '#E8EAF0',
    rowAlt: '#F5F5F8',
    white: '#FFFFFF',
    body: '#333333',
    muted: '#666666',
    border: '#CCCCCC',
};

// ==========================================
// STYLESHEET
// ==========================================
const s = StyleSheet.create({
    // ── Page ──
    page: {
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: C.body,
        paddingTop: 72,
        paddingBottom: 50,
        paddingHorizontal: 72, // 1-inch margins
    },

    // ── Cover ──
    coverPage: {
        fontFamily: 'Helvetica',
        backgroundColor: C.navy,
        padding: 72,
        justifyContent: 'space-between',
    },
    coverTitle: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 8 },
    coverSubtitle: { fontSize: 14, color: '#B0B0C0', marginBottom: 4 },
    coverDate: { fontSize: 11, color: '#8888A0' },
    coverBottom: { marginTop: 'auto' },
    coverMetaLabel: { fontSize: 9, color: '#8888A0', marginBottom: 2 },
    coverMetaValue: { fontSize: 11, color: C.white, fontFamily: 'Helvetica-Bold' },

    // ── Header / Footer ──
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 30, alignItems: 'center', justifyContent: 'center',
    },
    footerText: { fontSize: 8, color: C.muted },

    // ── Sections ──
    sectionTitle: {
        fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.navy,
        marginTop: 4, marginBottom: 4, paddingBottom: 6,
        borderBottomWidth: 2, borderBottomColor: C.navy,
    },
    subTitle: {
        fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.navy,
        marginTop: 14, marginBottom: 6,
    },

    // ── Key-Value Table (2-col) ──
    kvRow: {
        flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: C.border,
    },
    kvRowAlt: { backgroundColor: C.rowAlt },
    kvLabel: {
        width: '40%', paddingVertical: 6, paddingHorizontal: 10,
        fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.body,
    },
    kvValue: {
        width: '60%', paddingVertical: 6, paddingHorizontal: 10,
        fontSize: 10, color: C.body,
    },
    kvHeader: {
        flexDirection: 'row', backgroundColor: C.navy, paddingVertical: 6, paddingHorizontal: 10,
    },
    kvHeaderText: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.white },

    // ── Tables ──
    tableHeaderRow: {
        flexDirection: 'row', backgroundColor: C.navy,
        paddingVertical: 7, paddingHorizontal: 8,
    },
    tableHeaderCell: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.white },
    tableRow: {
        flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 8,
        borderBottomWidth: 0.5, borderBottomColor: C.border,
    },
    tableRowAlt: { backgroundColor: C.rowAlt },
    tableCell: { fontSize: 9, color: C.body },
    tableCellRight: { textAlign: 'right' },
    tableTotalRow: {
        flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 8,
        backgroundColor: C.lightBg, borderTopWidth: 1, borderTopColor: C.navy,
    },
    tableTotalCell: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.navy },

    // Flex helpers
    flex1: { flex: 1 },
    flex2: { flex: 2 },
    flex3: { flex: 3 },

    // ── Misc ──
    paragraph: { fontSize: 10, color: C.body, lineHeight: 1.5, marginBottom: 8 },
    caption: { fontSize: 9, fontStyle: 'italic', color: C.muted, marginBottom: 8 },
    spacer: { height: 12 },
    divider: { height: 0.5, backgroundColor: C.border, marginVertical: 10 },

    // ── Metric Cards ──
    metricsRow: { flexDirection: 'row', gap: 8, marginBottom: 12, marginTop: 8 },
    metricCard: {
        flex: 1, backgroundColor: C.lightBg, borderRadius: 4, padding: 10,
        borderLeftWidth: 3, borderLeftColor: C.navy,
    },
    metricValue: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.navy },
    metricLabel: { fontSize: 8, color: C.muted, marginTop: 2 },
});

// ==========================================
// HELPER COMPONENTS
// ==========================================

const Footer = () => (
    <View style={s.footer} fixed>
        <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
);

const SectionHeader = ({ title }) => (
    <Text style={s.sectionTitle}>{title}</Text>
);

const SubHeader = ({ title }) => (
    <Text style={s.subTitle}>{title}</Text>
);

// Key-value table (2-col with navy header)
const KVTable = ({ headerLabel, rows }) => (
    <View style={{ marginBottom: 12 }}>
        {headerLabel && (
            <View style={s.kvHeader}>
                <Text style={[s.kvHeaderText, { width: '40%' }]}>Field</Text>
                <Text style={[s.kvHeaderText, { width: '60%' }]}>Details</Text>
            </View>
        )}
        {rows.map((row, i) => (
            <View key={i} style={[s.kvRow, i % 2 !== 0 ? s.kvRowAlt : {}]} wrap={false}>
                <Text style={s.kvLabel}>{row.label}</Text>
                <Text style={s.kvValue}>{row.value ?? '—'}</Text>
            </View>
        ))}
    </View>
);

// Data table with navy header, alt rows, optional total
const DataTable = ({ columns, rows, showTotal, totalLabel, totalValue }) => (
    <View style={{ marginBottom: 12 }}>
        <View style={s.tableHeaderRow} fixed>
            {columns.map((col, i) => (
                <Text key={i} style={[
                    s.tableHeaderCell,
                    col.flex === 2 ? s.flex2 : (col.flex === 3 ? s.flex3 : s.flex1),
                    col.align === 'right' ? s.tableCellRight : {}
                ]}>
                    {col.label}
                </Text>
            ))}
        </View>
        {rows.map((row, i) => (
            <View key={i} style={[s.tableRow, i % 2 !== 0 ? s.tableRowAlt : {}]} wrap={false}>
                {columns.map((col, j) => {
                    const val = typeof col.key === 'function' ? col.key(row) : row[col.key];
                    return (
                        <Text key={j} style={[
                            s.tableCell,
                            col.flex === 2 ? s.flex2 : (col.flex === 3 ? s.flex3 : s.flex1),
                            col.align === 'right' ? s.tableCellRight : {}
                        ]}>
                            {val !== undefined && val !== null ? String(val) : ''}
                        </Text>
                    );
                })}
            </View>
        ))}
        {showTotal && (
            <View style={s.tableTotalRow} wrap={false}>
                <Text style={[s.tableTotalCell, s.flex1]}>{totalLabel || 'TOTAL'}</Text>
                {columns.slice(1, -1).map((_, i) => <Text key={i} style={[s.tableTotalCell, s.flex1]}> </Text>)}
                <Text style={[s.tableTotalCell, s.flex1, s.tableCellRight]}>{totalValue}</Text>
            </View>
        )}
    </View>
);

const MetricCard = ({ label, value }) => (
    <View style={s.metricCard}>
        <Text style={s.metricValue}>{value}</Text>
        <Text style={s.metricLabel}>{label.toUpperCase()}</Text>
    </View>
);

const BodyPage = ({ children }) => (
    <Page size="A4" style={s.page}>
        {children}
        <Footer />
    </Page>
);

// ==========================================
// DOCUMENT ASSEMBLY
// ==========================================

const MyDocument = ({ event, data }) => {
    const { dishes, procurements, inventory, attendance, meetings, tasks } = data;
    const typeInfo = EVENT_TYPES.find(t => t.value === event.type);
    const generatedOn = formatDate(new Date());

    // Compute metrics
    let totalExpenses = 0;
    procurements.forEach(p => p.items.forEach(i => { totalExpenses += Number(i.totalPrice || 0); }));
    const uniqueSevekaris = new Set(attendance.map(a => a.sevekariName || (a.sevekariId && a.sevekariId._id)));
    const totalSevekaris = uniqueSevekaris.size;
    const durationDays = event.endDate ? Math.max(1, Math.ceil((new Date(event.endDate) - new Date(event.startDate)) / (1000 * 60 * 60 * 24))) : 1;

    return (
        <Document>
            {/* =============== COVER PAGE =============== */}
            <Page size="A4" style={s.coverPage}>
                <View>
                    <Text style={s.coverTitle}>EVENT REPORT</Text>
                    <Text style={s.coverSubtitle}>{event.name}</Text>
                    <Text style={s.coverDate}>
                        {formatDate(event.startDate)}{event.endDate ? ` — ${formatDate(event.endDate)}` : ''}
                    </Text>
                </View>
                <View style={s.coverBottom}>
                    <Text style={s.coverMetaLabel}>Event Type</Text>
                    <Text style={s.coverMetaValue}>{typeInfo?.label || event.type}</Text>
                    <View style={s.spacer} />
                    <Text style={s.coverMetaLabel}>Expected Headcount</Text>
                    <Text style={s.coverMetaValue}>{event.expectedHeadcount}</Text>
                    <View style={s.spacer} />
                    <Text style={s.coverMetaLabel}>Report Generated</Text>
                    <Text style={s.coverMetaValue}>{generatedOn}</Text>
                </View>
            </Page>

            {/* =============== 01 | EVENT OVERVIEW =============== */}
            <BodyPage>
                <SectionHeader title="01  |  Event Overview" />

                <KVTable headerLabel rows={[
                    { label: 'Event Name', value: event.name },
                    { label: 'Event Type', value: typeInfo?.label || event.type },
                    { label: 'Date', value: `${formatDate(event.startDate)}${event.endDate ? ` — ${formatDate(event.endDate)}` : ''}` },
                    { label: 'Duration', value: `${durationDays} day${durationDays > 1 ? 's' : ''}` },
                    { label: 'Expected Headcount', value: String(event.expectedHeadcount) },
                    { label: 'Status', value: event.status?.charAt(0).toUpperCase() + event.status?.slice(1) },
                ]} />

                {event.description ? (
                    <>
                        <SubHeader title="Notes & Description" />
                        <Text style={s.paragraph}>{event.description}</Text>
                    </>
                ) : null}

                <SubHeader title="Operational Highlights" />
                <View style={s.metricsRow}>
                    <MetricCard label="Total Dishes" value={String(dishes.length)} />
                    <MetricCard label="Total Expenses" value={formatCurrency(totalExpenses)} />
                    <MetricCard label="Sevekaris" value={String(totalSevekaris)} />
                </View>
            </BodyPage>

            {/* =============== 02 | DISHES & MENU =============== */}
            {dishes.length > 0 && (
                <BodyPage>
                    <SectionHeader title="02  |  Dishes & Menu" />

                    <SubHeader title="Menu Overview" />
                    <DataTable
                        columns={[
                            { label: 'Dish Name', key: 'name', flex: 2 },
                            { label: 'Category', key: (r) => r.type?.charAt(0).toUpperCase() + r.type?.slice(1), flex: 1 },
                            { label: 'Headcount', key: (r) => String(r.headcount || '—'), flex: 1, align: 'right' },
                        ]}
                        rows={dishes}
                    />

                    {dishes.map((dish, idx) => (
                        <View key={idx} wrap={false} style={{ marginBottom: 14 }}>
                            <SubHeader title={`${dish.name} ${dish.type ? `(${dish.type.charAt(0).toUpperCase() + dish.type.slice(1)})` : ''}`} />
                            <KVTable rows={[
                                { label: 'Dish Name', value: dish.name },
                                { label: 'Headcount', value: String(dish.headcount || '—') },
                                { label: 'Total Yield', value: `${dish.totalYield?.amount || 0} ${dish.totalYield?.unit || ''}` },
                                { label: 'Leftover Quantity', value: `${dish.leftover?.amount || 0} ${dish.leftover?.unit || ''}` },
                            ]} />

                            {dish.ingredients && dish.ingredients.length > 0 && (
                                <>
                                    <Text style={s.caption}>Ingredients:</Text>
                                    <DataTable
                                        columns={[
                                            { label: 'Ingredient', key: 'name', flex: 2 },
                                            { label: 'Quantity', key: (r) => `${r.quantity} ${r.unit}`, flex: 1, align: 'right' },
                                        ]}
                                        rows={dish.ingredients}
                                    />
                                </>
                            )}

                            {dish.notes ? <Text style={s.caption}>Note: {dish.notes}</Text> : null}
                        </View>
                    ))}
                </BodyPage>
            )}

            {/* =============== 03 | PROCUREMENT SUMMARY =============== */}
            {procurements.length > 0 && (
                <BodyPage>
                    <SectionHeader title="03  |  Procurement Summary" />

                    <DataTable
                        columns={[
                            { label: 'Item', key: 'name', flex: 2 },
                            { label: 'Vendor', key: 'vendorName', flex: 2 },
                            { label: 'Unit Price', key: (r) => formatCurrency(r.ratePerUnit || 0), flex: 1 },
                            { label: 'Qty', key: (r) => `${r.quantity} ${r.unit}`, flex: 1 },
                            { label: 'Total Cost', key: (r) => formatCurrency(r.totalPrice || 0), flex: 1, align: 'right' },
                        ]}
                        rows={procurements.flatMap(p => p.items.map(item => ({
                            ...item,
                            vendorName: p.vendorName,
                        })))}
                        showTotal
                        totalLabel="TOTAL"
                        totalValue={formatCurrency(totalExpenses)}
                    />
                </BodyPage>
            )}

            {/* =============== 04 | INVENTORY USAGE =============== */}
            {inventory.length > 0 && (
                <BodyPage>
                    <SectionHeader title="04  |  Inventory Usage" />

                    <DataTable
                        columns={[
                            { label: 'Item', key: (r) => r.itemName || (r.inventoryItemId && r.inventoryItemId.name) || 'Unknown', flex: 2 },
                            { label: 'Quantity Taken', key: (r) => String(r.quantityUsed), flex: 1 },
                            { label: 'Unit', key: 'unit', flex: 1 },
                            { label: 'Reason / Notes', key: (r) => r.notes || r.sourceLocation || '—', flex: 2 },
                        ]}
                        rows={inventory}
                    />
                </BodyPage>
            )}

            {/* =============== 05 | ATTENDANCE =============== */}
            {attendance.length > 0 && (
                <BodyPage>
                    <SectionHeader title="05  |  Attendance" />

                    <SubHeader title="Summary" />
                    <KVTable headerLabel rows={[
                        { label: 'Total Expected', value: String(event.expectedHeadcount) },
                        { label: 'Total Present', value: String(attendance.length) },
                        {
                            label: 'Attendance Rate', value: event.expectedHeadcount > 0
                                ? `${Math.round((attendance.length / event.expectedHeadcount) * 100)}%`
                                : '—'
                        },
                    ]} />

                    <SubHeader title="Attendance List" />
                    <DataTable
                        columns={[
                            { label: '#', key: (r) => String(r._idx + 1), flex: 0.5 },
                            { label: 'Name', key: (r) => r.sevekariName || (r.sevekariId && r.sevekariId.name) || 'Unknown', flex: 2 },
                            { label: 'Role / Team', key: (r) => r.role || 'Volunteer', flex: 1 },
                            { label: 'Status', key: (r) => r.status || 'Present', flex: 1, align: 'right' },
                        ]}
                        rows={attendance.map((a, i) => ({ ...a, _idx: i }))}
                    />
                </BodyPage>
            )}

            {/* =============== 06 | MEETING NOTES =============== */}
            {meetings.length > 0 && (
                <BodyPage>
                    <SectionHeader title="06  |  Meeting Notes" />

                    {meetings.map((meeting, i) => (
                        <View key={i} wrap={false} style={{ marginBottom: 14 }}>
                            <SubHeader title={meeting.title} />
                            <KVTable rows={[
                                { label: 'Date & Time', value: formatDate(meeting.date) },
                                { label: 'Attendees', value: meeting.attendees?.join(', ') || '—' },
                                { label: 'Key Discussions', value: meeting.discussions || meeting.agenda || '—' },
                                { label: 'Decisions Made', value: meeting.decisions || '—' },
                                { label: 'Action Items', value: meeting.actionables?.map(a => `• ${a.title} (${(a.assignedTo && a.assignedTo.name) || (typeof a.assignedTo === 'string' ? a.assignedTo : 'Unassigned')})`).join('\n') || '—' },
                            ]} />
                            {meeting.notes ? <Text style={s.caption}>Notes: {meeting.notes}</Text> : null}
                        </View>
                    ))}
                </BodyPage>
            )}

            {/* =============== 07 | TASKS =============== */}
            {tasks.length > 0 && (
                <BodyPage>
                    <SectionHeader title="07  |  Tasks Register" />

                    <DataTable
                        columns={[
                            { label: 'Task', key: 'title', flex: 3 },
                            { label: 'Assignee', key: (r) => (r.assignedTo && r.assignedTo.name) || r.assignedToName || 'Unassigned', flex: 1 },
                            { label: 'Priority', key: (r) => String(r.priority).toUpperCase(), flex: 1 },
                            { label: 'Status', key: (r) => String(r.status).toUpperCase(), flex: 1, align: 'right' },
                        ]}
                        rows={tasks}
                    />
                </BodyPage>
            )}
        </Document>
    );
};


// ==========================================
// REACT COMPONENT (ReportTab)
// ==========================================

const ReportPdfSurface = ({ event, reportData }) => {
    if (!event || !reportData) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-[var(--color-bg-secondary)] p-4 rounded-xl border border-[var(--color-border)]">
                <div>
                    <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Event Report</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">Multi-page PDF following the official event report format.</p>
                </div>
                <PDFDownloadLink
                    document={<MyDocument event={event} data={reportData} />}
                    fileName={`${event.name.replace(/\s+/g, '_')}_Report.pdf`}
                >
                    {({ loading: pdfLoading }) => (
                        <Button size="sm" loading={pdfLoading}>
                            {pdfLoading ? 'Generating...' : 'Download PDF'}
                        </Button>
                    )}
                </PDFDownloadLink>
            </div>

            <Card className="flex flex-col h-[85vh] overflow-hidden bg-[var(--color-bg-secondary)] p-0">
                <div className="flex-1 w-full h-full">
                    <PDFViewer width="100%" height="100%" className="border-none">
                        <MyDocument event={event} data={reportData} />
                    </PDFViewer>
                </div>
            </Card>
        </div>
    );
};

export default ReportPdfSurface;
