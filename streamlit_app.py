import streamlit as st
import tempfile
import os
from minorprinting import generate_daily_schedules

st.set_page_config(page_title="Minor Printing Schedule", page_icon="🖨️")

st.title("🖨️ Minor Printing Schedule Generator")
st.write("Upload the Master Schedules CSV below to generate the formatted PDF.")

uploaded_file = st.file_uploader("Upload CSV", type="csv")

if uploaded_file is not None:
    if st.button("Generate PDF", type="primary"):
        with st.spinner("Processing your data..."):
            # generate_daily_schedules expects file paths, so we use temporary files
            with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp_in:
                tmp_in.write(uploaded_file.getvalue())
                tmp_in_path = tmp_in.name
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_out:
                tmp_out_path = tmp_out.name

            try:
                generate_daily_schedules(tmp_in_path, tmp_out_path, report_title="Minors Schedule")
                
                with open(tmp_out_path, "rb") as f:
                    pdf_bytes = f.read()
                
                st.success("PDF generated successfully!")
                st.download_button(
                    label="⬇️ Download PDF",
                    data=pdf_bytes,
                    file_name="Master_Minors_Printed_Version.pdf",
                    mime="application/pdf"
                )
            except Exception as e:
                st.error(f"An error occurred: {e}")
            finally:
                # Clean up the temporary files
                if os.path.exists(tmp_in_path):
                    os.remove(tmp_in_path)
                if os.path.exists(tmp_out_path):
                    os.remove(tmp_out_path)

st.write("")
col1, col2, col3 = st.columns([1, 2, 1])
with col2:
    st.image("goldengirls.jpeg", width="stretch")
