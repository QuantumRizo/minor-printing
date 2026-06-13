import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle

def generate_daily_schedules(input_csv, output_pdf, report_title="Minors Schedule"):
    print("Reading data...")
    # 1. DATA TRANSFORMATION
    df = pd.read_csv(input_csv)

    # Extract date for the report title
    date_val = ""
    if 'Date' in df.columns:
        date_val = str(df['Date'].iloc[0])
    elif 'Day' in df.columns:
        date_val = str(df['Day'].iloc[0])
        
    if date_val:
        report_title = f"Minors {date_val} A - Z"

    df = df.sort_values(by=['Last Name', 'First Name']).reset_index(drop=True)
    
    df['Person ID'] = range(1, len(df) + 1)
    df = df.rename(columns={'Person ID': ''})
    
    df['Preferred Name'] = df['Preferred Name'].fillna(df['First Name'])
    df = df.drop(columns=['First Name', 'Day', 'Date'], errors='ignore')
    
    df = df.rename(columns={
        'Preferred Name': 'Name',
        'Period 1': 'Minor 1',
        'Period 2': 'Minor 2',
        'Period 3': 'Minor 3'
    })
    
    cols = ['', 'Last Name', 'Name', 'Bunk', 'Minor 1', 'Minor 2', 'Minor 3']
    df = df[cols]

    # Clean up extremely long strings to prevent them from overlapping column lines
    for col in ['Minor 1', 'Minor 2', 'Minor 3']:
        df[col] = df[col].astype(str).apply(lambda x: x[:39] + '...' if len(x) > 42 else x)

    print("Generating formatted PDF...")
    # 3. GENERATE PDF
    
    # Push the top and bottom margins out just slightly more
    pdf = SimpleDocTemplate(
        output_pdf, 
        pagesize=landscape(letter),
        rightMargin=0.4*inch, 
        leftMargin=0.4*inch, 
        topMargin=0.35*inch,   # Reduced
        bottomMargin=0.35*inch # Reduced
    )
    
    elements = []

    # Prepare data structure for the table
    title_row = [report_title, '', '', '', '', '', '']
    header_row = df.columns.values.tolist()
    data = [title_row, header_row] + df.values.tolist()

    col_widths = [25, 80, 65, 40, 165, 165, 170] 
    
    # Compress the row height from 12 down to 11
    row_heights = [18] + [11] * (len(df) + 1)

    table = Table(data, repeatRows=2, colWidths=col_widths, rowHeights=row_heights)

    style = TableStyle([
        # --- TITLE ROW ---
        ('SPAN', (0, 0), (-1, 0)),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('VALIGN', (0, 0), (-1, 0), 'MIDDLE'),

        # --- HEADER ROW ---
        ('BACKGROUND', (0, 1), (-1, 1), colors.lightgrey),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 1), (-1, 1), 7), # Shrunk to 7
        ('ALIGN', (0, 1), (-1, 1), 'LEFT'),
        
        # --- DATA ROWS ---
        ('FONTNAME', (0, 2), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 2), (-1, -1), 7), # Shrunk to 7
        ('ALIGN', (0, 2), (-1, -1), 'LEFT'),
        
        # --- GLOBAL TABLE SETTINGS ---
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('TOPPADDING', (0, 0), (-1, -1), 1),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
        ('LEFTPADDING', (0, 0), (-1, -1), 2),
        ('RIGHTPADDING', (0, 0), (-1, -1), 2),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('VALIGN', (0, 1), (-1, -1), 'MIDDLE'),
    ])
    table.setStyle(style)

    elements.append(table)
    pdf.build(elements)
    print(f"Success! Saved to {output_pdf}")

if __name__ == "__main__":
    generate_daily_schedules(
        input_csv='MasterSchedules.csv',
        output_pdf='Master_Minors_Printed_Version.pdf',
        report_title='Minors June 12th A - Z'
    )