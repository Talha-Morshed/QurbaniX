from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor

text = '''
QurbaniX Project Analysis

This project is a React + Vite frontend prototype for QurbaniX. The main route map is defined in the application entry file and controls the full user journey across the app. The landing page introduces the brand and directs users to the role-selection step. From there, visitors choose whether they are a Customer, Butcher, or Administrator, and they are sent into the corresponding registration flow.

Page-to-package mapping:
- Landing page: acts as the public entry point and routes the user into the onboarding flow.
- Role selection page: chooses which registration package the user should follow.
- Customer registration page: handles customer account creation, validation, and agreement to the terms.
- Butcher registration page: handles a richer business-signup flow, including National ID, address, years of experience, and service area.
- Admin registration page: captures admin account details and approval-style messaging.
- Customer login page: validates email or phone number and password, then redirects to the customer dashboard.
- Butcher login page: validates the same credential format and redirects to the butcher dashboard.
- Forgot Password and Reset Password pages: support the recovery flow for both customer and butcher users.
- Terms and Conditions page: provides the project’s legal/documentation content through a structured section layout.
- Customer dashboard: a placeholder experience showing the future direction for customer features.
- Butcher dashboard: a more developed business panel showing package stats, package management cards, request queue, and operational snapshot data.

Project structure and package responsibilities:
- frontend/src/pages contains the page-level screens for the user journey.
- frontend/src/components holds shared layout pieces like the header, footer, form shell, role card, and terms components.
- frontend/src/utils/validation.jsx provides reusable email and phone validation rules.
- frontend/src/constants/locations.js supplies district suggestions for address and service-area fields.
- package.json shows the current frontend stack: React, React Router, Tailwind CSS, and Vite.

Currently available features:
- Landing page with hero branding and a “Get Started” journey.
- Role-based onboarding for Customer, Butcher, and Administrator.
- Customer registration form with validation and terms acceptance.
- Butcher registration form with business-specific inputs and notice text.
- Admin registration form with approval-style feedback.
- Customer and butcher login forms with validation, show/hide password, remember-me, forgot-password, and route-based dashboard access.
- Password recovery flow for both customer and butcher users.
- Structured Terms & Conditions page.
- Dashboard pages for both customer and butcher roles.
- Butcher dashboard upgrade with metrics, package cards, request queue, and operations snapshot.

Important limitation:
This is currently a frontend UI prototype rather than a full production system. The README describes the intended backend architecture with PHP, MySQL, Apache/XAMPP, and payment APIs, but those systems are not yet connected in the present workspace. Most of the project is client-side only, with local validation and simulated navigation rather than live database or payment integration.
'''

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleStyle', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=18, textColor=HexColor('#9b1455'), leading=22, spaceAfter=12))
styles.add(ParagraphStyle(name='BodyStyle', parent=styles['BodyText'], fontName='Helvetica', fontSize=10.8, leading=14, spaceAfter=8, textColor=HexColor('#1f2937')))
styles.add(ParagraphStyle(name='BoldBody', parent=styles['BodyText'], fontName='Helvetica-Bold', fontSize=10.8, leading=14, spaceAfter=8, textColor=HexColor('#111827')))

story = []
story.append(Paragraph('QurbaniX Project Analysis', style='TitleStyle'))
for paragraph in text.split('\n\n'):
    if not paragraph.strip():
        continue
    story.append(Paragraph(paragraph.strip(), style='BodyStyle'))
    story.append(Spacer(1, 4 * mm))

pdf = SimpleDocTemplate('QurbaniX_Project_Analysis.pdf', pagesize=A4, rightMargin=18*mm, leftMargin=18*mm, topMargin=18*mm, bottomMargin=18*mm)
pdf.build(story)
print('PDF created: QurbaniX_Project_Analysis.pdf')
