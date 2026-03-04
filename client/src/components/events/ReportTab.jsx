import { useState, useEffect } from 'react';
import { PDFViewer, PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Loader2 } from 'lucide-react';
import { dishAPI, procurementAPI, attendanceAPI, inventoryUsedAPI, meetingAPI, taskAPI } from '../../api/endpoints';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { EVENT_TYPES } from '../../utils/constants';
import Card from '../ui/Card';

// ==========================================
// STEP 1 — FONT REGISTRATION
// Using stable Google Fonts TTF URLs (woff2 hashes change and break)
// ==========================================
Font.register({
    family: 'Nunito',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/nunito@latest/latin-400-normal.ttf', fontWeight: 400 },
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/nunito@latest/latin-600-normal.ttf', fontWeight: 600 },
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/nunito@latest/latin-700-normal.ttf', fontWeight: 700 },
    ]
});

// ==========================================
// STEP 2 — COLOR PALETTE
// ==========================================
const COLORS = {
    primary: '#E8621A',
    primaryDark: '#C24E0D',
    primaryLight: '#FFF5E8',
    accent: '#3D8B37',
    accentLight: '#EAF4E9',
    highlight: '#F5C842',
    white: '#FFFFFF',
    rowAlt: '#F9F6F1',
    border: '#E8D5B7',
    textPrimary: '#1A1208',
    textSecondary: '#5C4A2A',
    textMuted: '#9C8060',
    footerBg: '#2A1F0E',
};

// ==========================================
// STEP 3 — STYLESHEET
// ==========================================
const styles = StyleSheet.create({
    // Page
    page: { fontFamily: 'Nunito', backgroundColor: COLORS.white, paddingTop: 100, paddingBottom: 60, paddingHorizontal: 40 },

    // Cover
    coverPage: { backgroundColor: COLORS.primary, padding: 0 },
    coverAccentStrip: { height: 8, backgroundColor: COLORS.highlight },
    coverTitle: { fontSize: 32, fontWeight: 700, color: COLORS.white, marginTop: 60, marginHorizontal: 40 },
    coverSubtitle: { fontSize: 14, fontWeight: 400, color: COLORS.primaryLight, marginTop: 8, marginHorizontal: 40 },
    coverDate: { fontSize: 11, color: COLORS.primaryLight, marginTop: 4, marginHorizontal: 40 },
    coverBottomStrip: { height: 12, backgroundColor: COLORS.primaryDark, position: 'absolute', bottom: 0, left: 0, right: 0 },
    coverMetaContainer: { position: 'absolute', bottom: 40, left: 40 },
    coverMetaLabel: { fontSize: 10, color: COLORS.primaryLight },
    coverMetaValue: { fontSize: 12, color: COLORS.white, fontWeight: 700 },

    // Header (fixed)
    header: { position: 'absolute', top: 0, left: 0, right: 0, height: 70, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 40, justifyContent: 'space-between' },
    headerTitle: { fontSize: 11, fontWeight: 700, color: COLORS.white, letterSpacing: 1 },
    headerPageNum: { fontSize: 10, color: COLORS.primaryLight },

    // Footer (fixed)
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 36, backgroundColor: COLORS.footerBg, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 40, justifyContent: 'space-between' },
    footerText: { fontSize: 8, color: COLORS.primaryLight },

    // Section
    sectionHeader: { backgroundColor: COLORS.primaryLight, borderLeftWidth: 4, borderLeftColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 12, marginTop: 20 },
    sectionTitle: { fontSize: 13, fontWeight: 700, color: COLORS.primary },

    // Metric Cards
    metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    metricCard: { flex: 1, backgroundColor: COLORS.rowAlt, borderRadius: 6, padding: 12, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
    metricValue: { fontSize: 22, fontWeight: 700, color: COLORS.primary },
    metricLabel: { fontSize: 9, color: COLORS.textMuted, marginTop: 2 },

    // Dynamic Metric Card Styles (to avoid inline objects)
    metricCardAccent: { borderLeftColor: COLORS.accent },
    metricValueAccent: { color: COLORS.accent },
    metricCardPrimaryDark: { borderLeftColor: COLORS.primaryDark },
    metricValuePrimaryDark: { color: COLORS.primaryDark },
    metricCardHighlight: { borderLeftColor: COLORS.highlight },
    metricValueHighlight: { color: COLORS.highlight },
    metricCardTextMuted: { borderLeftColor: COLORS.textMuted },
    metricValueTextMuted: { color: COLORS.textMuted },

    // Table
    tableWrapper: { marginBottom: 15 },
    tableHeaderRow: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 10 },
    tableHeaderCell: { fontSize: 9, fontWeight: 700, color: COLORS.white },
    tableRow: { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    tableRowAlt: { backgroundColor: COLORS.rowAlt },
    tableCell: { fontSize: 9, color: COLORS.textPrimary },
    tableCellRight: { textAlign: 'right' },
    tableTotalRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 10, backgroundColor: COLORS.primaryLight, borderTopWidth: 1.5, borderTopColor: COLORS.primary },
    tableTotalCell: { fontSize: 9, fontWeight: 700, color: COLORS.primary, flex: 1 },
    tableTotalCellRight: { fontSize: 9, fontWeight: 700, color: COLORS.primary, flex: 1, textAlign: 'right' },

    // Table Flex Columns (to avoid inline objects for flex sizing)
    flex1: { flex: 1 },
    flex2: { flex: 2 },
    flex3: { flex: 3 },

    // Divider
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 14 },

    // Misc Content
    paragraph: { fontSize: 10, color: COLORS.textSecondary, lineHeight: 1.5, marginBottom: 10 },
    listItem: { fontSize: 10, color: COLORS.textSecondary, marginBottom: 5, paddingLeft: 10 },

    // Dishes Section
    dishWrapper: { marginBottom: 15 },
    dishCard: { backgroundColor: COLORS.rowAlt, padding: 10, borderLeftWidth: 2, borderLeftColor: COLORS.primary },
    dishTitle: { fontSize: 13, fontWeight: 700, color: COLORS.textPrimary },
    dishCategory: { fontSize: 9, color: COLORS.textMuted, marginTop: 2 },
    dishMetricsRow: { flexDirection: 'row', marginTop: 8 },
    dishMetricCol: { flex: 1 },
    dishMetricLabel: { fontSize: 8, color: COLORS.textMuted },
    dishMetricValue: { fontSize: 10, fontWeight: 700, color: COLORS.textPrimary },
    dishIngredientsWrapper: { marginTop: 5, paddingLeft: 10 },
    dishIngredientsTitle: { fontSize: 9, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 4 },
    dishNote: { fontSize: 10, color: COLORS.textSecondary, lineHeight: 1.5, marginBottom: 10, marginTop: 5, paddingLeft: 10, fontStyle: 'italic' },

    // MoM Section
    momMeeting: { marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    momTitle: { fontSize: 13, fontWeight: 700, color: COLORS.primaryDark },
    momDate: { fontSize: 9, color: COLORS.textMuted, marginBottom: 5 },
    momActionsWrapper: { marginTop: 8 },
    momActionsTitle: { fontSize: 9, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 4 }
});

// ==========================================
// STEP 4 — COMPONENTS TO BUILD
// ==========================================

const CoverPage = ({ title, eventName, date, generatedOn }) => (
    <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverAccentStrip} />
        <Text style={styles.coverTitle}>{title}</Text>
        <Text style={styles.coverSubtitle}>{eventName}</Text>
        <Text style={styles.coverDate}>{date}</Text>

        <View style={styles.coverMetaContainer}>
            <Text style={styles.coverMetaLabel}>Report Generated:</Text>
            <Text style={styles.coverMetaValue}>{generatedOn}</Text>
        </View>
        <View style={styles.coverBottomStrip} />
    </Page>
);

const ReportHeader = ({ title }) => (
    <View style={styles.header} fixed>
        <Text style={styles.headerTitle}>{title.toUpperCase()}</Text>
        <Text style={styles.headerPageNum} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
);

const ReportFooter = ({ generatedOn }) => (
    <View style={styles.footer} fixed>
        <Text style={styles.footerText}>TEMPLE KITCHEN MANAGEMENT</Text>
        <Text style={styles.footerText}>{generatedOn}</Text>
    </View>
);

const SectionHeader = ({ title }) => (
    <View style={styles.sectionHeader} wrap={false}>
        <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
    </View>
);

const MetricCard = ({ label, value, hexColorCode }) => {
    // strict style matching to avoid inline hex objects
    let cardStyle = styles.metricCard;
    let textStyle = styles.metricValue;

    if (hexColorCode === COLORS.accent) { cardStyle = [styles.metricCard, styles.metricCardAccent]; textStyle = [styles.metricValue, styles.metricValueAccent]; }
    else if (hexColorCode === COLORS.primaryDark) { cardStyle = [styles.metricCard, styles.metricCardPrimaryDark]; textStyle = [styles.metricValue, styles.metricValuePrimaryDark]; }
    else if (hexColorCode === COLORS.highlight) { cardStyle = [styles.metricCard, styles.metricCardHighlight]; textStyle = [styles.metricValue, styles.metricValueHighlight]; }
    else if (hexColorCode === COLORS.textMuted) { cardStyle = [styles.metricCard, styles.metricCardTextMuted]; textStyle = [styles.metricValue, styles.metricValueTextMuted]; }

    return (
        <View style={cardStyle}>
            <Text style={textStyle}>{value}</Text>
            <Text style={styles.metricLabel}>{label.toUpperCase()}</Text>
        </View>
    );
};

const MetricsRow = ({ metrics }) => (
    <View style={styles.metricsRow}>
        {metrics.map((m, i) => (
            <MetricCard key={i} label={m.label} value={m.value} hexColorCode={m.color} />
        ))}
    </View>
);

const StyledTable = ({ columns, rows, showTotal, totalLabel, totalValue }) => (
    <View style={styles.tableWrapper}>
        {/* Header */}
        <View style={styles.tableHeaderRow} fixed>
            {columns.map((col, i) => (
                <Text key={i} style={[
                    styles.tableHeaderCell,
                    col.flex === 2 ? styles.flex2 : (col.flex === 3 ? styles.flex3 : styles.flex1),
                    col.align === 'right' ? styles.tableCellRight : {}
                ]}>
                    {col.label}
                </Text>
            ))}
        </View>

        {/* Rows */}
        {rows.map((row, i) => (
            <View key={i} style={[styles.tableRow, i % 2 !== 0 ? styles.tableRowAlt : {}]} wrap={false}>
                {columns.map((col, j) => {
                    const val = typeof col.key === 'function' ? col.key(row) : row[col.key];
                    return (
                        <Text key={j} style={[
                            styles.tableCell,
                            col.flex === 2 ? styles.flex2 : (col.flex === 3 ? styles.flex3 : styles.flex1),
                            col.align === 'right' ? styles.tableCellRight : {}
                        ]}>
                            {val !== undefined && val !== null ? String(val) : ''}
                        </Text>
                    );
                })}
            </View>
        ))}

        {/* Footer/Total */}
        {showTotal && (
            <View style={styles.tableTotalRow} wrap={false}>
                <Text style={styles.tableTotalCell}>{totalLabel || 'Total'}</Text>
                <Text style={styles.tableTotalCellRight}>{totalValue}</Text>
            </View>
        )}
    </View>
);

const Divider = () => <View style={styles.divider} />;

const BodyPage = ({ children, headerTitle, generatedOn }) => (
    <Page size="A4" style={styles.page}>
        <ReportHeader title={headerTitle} />
        {children}
        <ReportFooter generatedOn={generatedOn} />
    </Page>
);


// ==========================================
// STEP 5 — DOCUMENT ASSEMBLY
// ==========================================

const MyDocument = ({ event, data }) => {
    const { dishes, procurements, inventory, attendance, meetings, tasks } = data;
    const typeInfo = EVENT_TYPES.find(t => t.value === event.type);
    const generatedOn = formatDate(new Date());

    // Compute Metrics
    const totalDishes = dishes.length;
    let totalExpenses = 0;
    procurements.forEach(p => p.items.forEach(i => { totalExpenses += Number(i.totalPrice || 0) }));

    // Plain computation — hooks cannot be used inside @react-pdf/renderer Document components
    const uniqueSevekaris = new Set(attendance.map(a => a.sevekariName || (a.sevekariId && a.sevekariId._id)));
    const totalSevekaris = uniqueSevekaris.size;

    const pendingTasks = tasks.filter(t => t.status !== 'completed').length;

    return (
        <Document>
            <CoverPage
                title="COMPREHENSIVE EVENT REPORT"
                eventName={event.name}
                date={`${formatDate(event.startDate)} ${event.endDate ? `— ${formatDate(event.endDate)}` : ''}`}
                generatedOn={generatedOn}
            />

            {/* PAGE 2: Summary */}
            <BodyPage headerTitle={`${event.name} — Summary Overview`} generatedOn={generatedOn}>
                <SectionHeader title="Event Overview" />
                <MetricsRow metrics={[
                    { label: 'Expected Headcount', value: String(event.expectedHeadcount) },
                    { label: 'Event Type', value: typeInfo?.label || event.type },
                    { label: 'Status', value: event.status.toUpperCase() },
                    { label: 'Duration (Days)', value: event.endDate ? String(Math.max(1, Math.ceil((new Date(event.endDate) - new Date(event.startDate)) / (1000 * 60 * 60 * 24)))) : '1' }
                ]} />

                <Divider />

                <SectionHeader title="Operational Highlights" />
                <MetricsRow metrics={[
                    { label: 'Total Dishes', value: String(totalDishes), color: COLORS.accent },
                    { label: 'Total Expenses', value: formatCurrency(totalExpenses), color: COLORS.primaryDark },
                    { label: 'Unique Sevekaris', value: String(totalSevekaris), color: COLORS.highlight },
                    { label: 'Pending Tasks', value: String(pendingTasks), color: COLORS.textMuted }
                ]} />

                {event.description ? (
                    <>
                        <Divider />
                        <SectionHeader title="Notes & Description" />
                        <Text style={styles.paragraph}>{event.description}</Text>
                    </>
                ) : null}
            </BodyPage>

            {/* PAGE 3: Menu & Dishes */}
            {dishes.length > 0 && (
                <BodyPage headerTitle={`${event.name} — Menu & Food Production`} generatedOn={generatedOn}>
                    <SectionHeader title="Approved Menu Roster" />

                    {dishes.map((dish, idx) => (
                        <View key={idx} wrap={false} style={styles.dishWrapper}>
                            <View style={styles.dishCard}>
                                <Text style={styles.dishTitle}>{dish.name} {dish.type ? `(${dish.type.toUpperCase()})` : ''}</Text>
                                <Text style={styles.dishCategory}>Category: {dish.type || 'N/A'}</Text>

                                <View style={styles.dishMetricsRow}>
                                    <View style={styles.dishMetricCol}>
                                        <Text style={styles.dishMetricLabel}>Target Headcount</Text>
                                        <Text style={styles.dishMetricValue}>{dish.headcount || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.dishMetricCol}>
                                        <Text style={styles.dishMetricLabel}>Planned Yield</Text>
                                        <Text style={styles.dishMetricValue}>{dish.totalYield?.amount || 0} {dish.totalYield?.unit || dish.unit || ''}</Text>
                                    </View>
                                    <View style={styles.dishMetricCol}>
                                        <Text style={styles.dishMetricLabel}>Leftover Log</Text>
                                        <Text style={styles.dishMetricValue}>{dish.leftover?.amount || 0} {dish.leftover?.unit || dish.unit || ''}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Dish Ingredients Table */}
                            {dish.ingredients && dish.ingredients.length > 0 ? (
                                <View style={styles.dishIngredientsWrapper}>
                                    <Text style={styles.dishIngredientsTitle}>Ingredient Specifications:</Text>
                                    <StyledTable
                                        columns={[
                                            { label: 'Ingredient Name', key: 'name', flex: 2 },
                                            { label: 'Required Quantity', key: (r) => `${r.quantity} ${r.unit}`, flex: 1, align: 'right' }
                                        ]}
                                        rows={dish.ingredients}
                                    />
                                </View>
                            ) : null}

                            {dish.notes ? (
                                <Text style={styles.dishNote}>Note: {dish.notes}</Text>
                            ) : null}
                        </View>
                    ))}
                </BodyPage>
            )}

            {/* PAGE 4: Procurement */}
            {procurements.length > 0 && (
                <BodyPage headerTitle={`${event.name} — Procurement & Expenses`} generatedOn={generatedOn}>
                    <SectionHeader title="Expenditure Ledger" />
                    <StyledTable
                        columns={[
                            { label: 'Vendor / Supplier', key: (r) => r.vendorName || (r.vendorId && r.vendorId.name) || 'Unknown', flex: 2 },
                            { label: 'Item Procured', key: 'itemName', flex: 2 },
                            { label: 'Quantity', key: (r) => `${r.quantity} ${r.unit}`, flex: 1 },
                            { label: 'Cost', key: (r) => formatCurrency(r.totalPrice), flex: 1, align: 'right' }
                        ]}
                        rows={procurements.flatMap(p => p.items.map(item => ({ ...item, vendorName: p.vendorName, vendorId: p.vendorId })))}
                        showTotal={true}
                        totalLabel="Total Event Expenditures"
                        totalValue={formatCurrency(totalExpenses)}
                    />
                </BodyPage>
            )}

            {/* PAGE 5: Inventory LOG */}
            {inventory.length > 0 && (
                <BodyPage headerTitle={`${event.name} — Inventory Consumption`} generatedOn={generatedOn}>
                    <SectionHeader title="Stock Deductions" />
                    <StyledTable
                        columns={[
                            { label: 'Item Name', key: (r) => r.itemName || (r.inventoryItemId && r.inventoryItemId.name) || 'Unknown', flex: 2 },
                            { label: 'Source Location', key: (r) => r.sourceLocation || 'Main Kitchen', flex: 2 },
                            { label: 'Quantity Deducted', key: (r) => `${r.quantityUsed} ${r.unit}`, flex: 1, align: 'right' }
                        ]}
                        rows={inventory}
                    />
                </BodyPage>
            )}

            {/* PAGE 6: Attendance */}
            {attendance.length > 0 && (
                <BodyPage headerTitle={`${event.name} — Sevekari Attendance`} generatedOn={generatedOn}>
                    <SectionHeader title="Volunteer Duty Log" />
                    <StyledTable
                        columns={[
                            { label: 'Sevekari Name', key: (r) => r.sevekariName || (r.sevekariId && r.sevekariId.name) || 'Unknown', flex: 2 },
                            { label: 'Assigned Role', key: (r) => r.role || 'Volunteer', flex: 1 },
                            { label: 'Shift Details', key: (r) => r.shift || 'Full Day', flex: 1 },
                            { label: 'Current Status', key: (r) => String(r.status || 'Present'), flex: 1, align: 'right' }
                        ]}
                        rows={attendance}
                    />
                </BodyPage>
            )}

            {/* PAGE 7: MoM & Tasks */}
            {(meetings.length > 0 || tasks.length > 0) && (
                <BodyPage headerTitle={`${event.name} — Meetings & Operations`} generatedOn={generatedOn}>
                    {meetings.length > 0 && (
                        <>
                            <SectionHeader title="Minutes of Meetings" />
                            {meetings.map((meeting, i) => (
                                <View key={i} wrap={false} style={styles.momMeeting}>
                                    <Text style={styles.momTitle}>{meeting.title}</Text>
                                    <Text style={styles.momDate}>Date: {formatDate(meeting.date)}</Text>

                                    {meeting.notes ? <Text style={styles.paragraph}>{meeting.notes}</Text> : null}

                                    {meeting.actionables && meeting.actionables.length > 0 ? (
                                        <View style={styles.momActionsWrapper}>
                                            <Text style={styles.momActionsTitle}>Key Actionables:</Text>
                                            {meeting.actionables.map((act, j) => (
                                                <Text key={j} style={styles.listItem}>
                                                    • {act.title} (Assignee: {(act.assignedTo && act.assignedTo.name) || (typeof act.assignedTo === 'string' ? act.assignedTo : 'Unassigned')})
                                                </Text>
                                            ))}
                                        </View>
                                    ) : null}
                                </View>
                            ))}
                        </>
                    )}

                    {tasks.length > 0 && (
                        <>
                            <SectionHeader title="Operational Tasks Register" />
                            <StyledTable
                                columns={[
                                    { label: 'Task Description', key: 'title', flex: 2 },
                                    { label: 'Priority', key: (r) => String(r.priority).toUpperCase(), flex: 1 },
                                    { label: 'Status', key: (r) => String(r.status).toUpperCase(), flex: 1 },
                                    { label: 'Assignee', key: (r) => (r.assignedTo && r.assignedTo.name) || r.assignedToName || 'Unassigned', flex: 1, align: 'right' }
                                ]}
                                rows={tasks}
                            />
                        </>
                    )}
                </BodyPage>
            )}
        </Document>
    );
};


// ==========================================
// STEP 6 — REACT APP INTEGRATION (ReportTab)
// ==========================================

const ReportTab = ({ event }) => {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [dishesRes, procRes, attRes, invRes, meetRes, taskRes] = await Promise.all([
                    dishAPI.getByEvent(event._id),
                    procurementAPI.getByEvent(event._id),
                    attendanceAPI.getByEvent(event._id),
                    inventoryUsedAPI.getByEvent(event._id),
                    meetingAPI.getByEvent(event._id),
                    taskAPI.getByEvent(event._id)
                ]);

                setReportData({
                    dishes: dishesRes.data.data || [],
                    procurements: procRes.data.data || [],
                    attendance: attRes.data.data || [],
                    inventory: invRes.data.data || [],
                    meetings: meetRes.data.data || [],
                    tasks: taskRes.data.data || []
                });
            } catch (error) {
                console.error('Failed to load report data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [event._id]);

    if (loading || !reportData) {
        return (
            <Card className="p-12">
                <div className="flex flex-col items-center justify-center text-[var(--color-text-muted)]">
                    <Loader2 size={40} className="animate-spin mb-4 text-[var(--color-primary)]" />
                    <p className="font-medium text-lg">Gathering Event Records...</p>
                    <p className="text-sm mt-1">Please wait while we compile the multi-page report</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-[var(--color-bg-secondary)] p-4 rounded-xl border border-[var(--color-border)]">
                <div>
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Expert PDF Report</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">View and download a strictly structured, multi-page print-ready document.</p>
                </div>
                <PDFDownloadLink
                    document={<MyDocument event={event} data={reportData} />}
                    fileName={`${event.name.replace(/\s+/g, '_')}_Report.pdf`}
                    className="btn btn-primary"
                >
                    {({ loading }) => loading ? 'Generating PDF...' : 'Download PDF'}
                </PDFDownloadLink>
            </div>

            <Card className="flex flex-col h-[90vh] overflow-hidden bg-[var(--color-bg-secondary)] p-0">
                <div className="flex-1 w-full h-full">
                    <PDFViewer width="100%" height="100%" className="border-none">
                        <MyDocument event={event} data={reportData} />
                    </PDFViewer>
                </div>
            </Card>
        </div>
    );
};

export default ReportTab;
