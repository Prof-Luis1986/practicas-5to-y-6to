from pathlib import Path
from io import BytesIO
from PIL import Image, ImageOps
from pillow_heif import register_heif_opener
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
    PageBreak, Image as RLImage, Table, TableStyle, KeepTogether, Preformatted)
from reportlab.pdfgen import canvas
from pypdf import PdfReader, PdfWriter

ROOT = Path('/Volumes/ADATA SD620/Proyectos_2025-2026/practicas 5to y 6to')
TMP = ROOT/'tmp/pdfs'
OUT = ROOT/'output/pdf/Practicas_Area_1_Fase_5_Robot_Esquiva_Obstaculos.pdf'
SRC = Path('/Volumes/ADATA SD620/Prácticas Área 1-Robot Esquiva Obstaculos.pdf')
BLOCKS = Path('/Users/luismartinez/Desktop/Captura de pantalla 2026-08-19 a la(s) 7.56.24 p.m..png')
register_heif_opener()

pdfmetrics.registerFont(TTFont('Arial', '/System/Library/Fonts/Supplemental/Arial.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Bold', '/System/Library/Fonts/Supplemental/Arial Bold.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Italic', '/System/Library/Fonts/Supplemental/Arial Italic.ttf'))
pdfmetrics.registerFont(TTFont('Courier', '/System/Library/Fonts/Supplemental/Courier New.ttf'))

PURPLE = colors.HexColor('#5B247A'); MAGENTA = colors.HexColor('#A83FA5')
TEAL = colors.HexColor('#117C82'); ORANGE = colors.HexColor('#F4A51C')
INK = colors.HexColor('#263238'); PALE = colors.HexColor('#F4EFF8')
LIGHT = colors.HexColor('#F3F7F8'); GREEN = colors.HexColor('#3E9E55')

styles=getSampleStyleSheet()
body=ParagraphStyle('Body',fontName='Arial',fontSize=10.2,leading=14,textColor=INK,spaceAfter=7)
small=ParagraphStyle('Small',parent=body,fontSize=8.6,leading=11.5)
h1=ParagraphStyle('H1',fontName='Arial-Bold',fontSize=25,leading=29,textColor=PURPLE,spaceAfter=10)
h2=ParagraphStyle('H2',fontName='Arial-Bold',fontSize=16,leading=20,textColor=PURPLE,spaceBefore=5,spaceAfter=8)
h3=ParagraphStyle('H3',fontName='Arial-Bold',fontSize=11.5,leading=14,textColor=TEAL,spaceBefore=4,spaceAfter=4)
cap=ParagraphStyle('Cap',fontName='Arial',fontSize=8,leading=10,textColor=colors.HexColor('#455A64'),alignment=TA_CENTER)
code_style=ParagraphStyle('Code',fontName='Courier',fontSize=7.2,leading=9.1,textColor=colors.HexColor('#17351C'))

def header_footer(c, doc):
    w,h=A4; c.saveState()
    c.setFillColor(PURPLE); c.rect(0,h-0.6*cm,w,0.6*cm,fill=1,stroke=0)
    c.setFont('Arial-Bold',8); c.setFillColor(colors.white)
    c.drawString(1.4*cm,h-0.39*cm,'INFORMÁTICA APLICADA A LA CIENCIA Y A LA INDUSTRIA')
    c.setStrokeColor(colors.HexColor('#D4C2DF')); c.line(1.4*cm,1.25*cm,w-1.4*cm,1.25*cm)
    c.setFillColor(colors.HexColor('#56616A')); c.setFont('Arial',8)
    c.drawString(1.4*cm,0.75*cm,'Fase 5 - Robótica móvil')
    c.drawRightString(w-1.4*cm,0.75*cm,str(doc.page + 9))
    c.restoreState()

def img(path, width, height=None):
    im=Image.open(path); im=ImageOps.exif_transpose(im).convert('RGB')
    if height is None: height=width*im.height/im.width
    scale=min(width/im.width,height/im.height)
    nw,nh=int(im.width*scale),int(im.height*scale)
    bg=Image.new('RGB',(int(width*4),int(height*4)),'white')
    rs=im.resize((int(nw*4),int(nh*4)))
    bg.paste(rs,((bg.width-rs.width)//2,(bg.height-rs.height)//2))
    b=BytesIO(); bg.save(b,'JPEG',quality=92); b.seek(0)
    return RLImage(b,width=width,height=height)

def callout(title, text, color=PURPLE):
    t=Table([[Paragraph(title,ParagraphStyle('ct',parent=h3,textColor=colors.white,spaceAfter=0)),
              Paragraph(text,small)]],colWidths=[4.2*cm,12.2*cm])
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(0,0),color),('BACKGROUND',(1,0),(1,0),LIGHT),
        ('BOX',(0,0),(-1,-1),.7,color),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('PADDING',(0,0),(-1,-1),8)]))
    return t

def bullets(items):
    return [Paragraph('• '+x,body) for x in items]

story=[]
story += [Spacer(1,1.2*cm), Paragraph('FASE 5',h1), Paragraph('Robótica móvil: diseño, construcción y autonomía',h2),
          Paragraph('Esta fase reúne proyectos de integración en los que el estudiante diseña, construye, programa, prueba y documenta robots móviles. La práctica del robot esquiva obstáculos se incorpora como cierre integrador.',body), Spacer(1,.2*cm)]
rows=[
('Práctica 17','Robot Sumo 4WD de 1 kg con Arduino'),
('Práctica 19','Conociendo y diseñando mi Robot Soccer'),
('Práctica 20','Componentes del Robot Soccer - Parte 1'),
('Práctica 20.1','Marcador inteligente para Robot Soccer'),
('Práctica 21','Cómo está construido nuestro Robot Soccer'),
('Práctica 22','Robot autónomo esquiva obstáculos')]
data=[[Paragraph('<b>Actividad</b>',body),Paragraph('<b>Proyecto</b>',body)]]+[[Paragraph(a,body),Paragraph(b,body)] for a,b in rows]
t=Table(data,colWidths=[4.2*cm,12.2*cm],repeatRows=1)
t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),PURPLE),('TEXTCOLOR',(0,0),(-1,0),colors.white),('GRID',(0,0),(-1,-1),.5,colors.HexColor('#CAB9D5')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,PALE]),('PADDING',(0,0),(-1,-1),8)])); story += [t,Spacer(1,.45*cm),callout('Ubicación curricular','Las prácticas 17, 19, 20, 20.1 y 21 dejan de presentarse en la fase anterior y forman parte de esta nueva Fase 5. La práctica 18 permanece fuera de esta agrupación.'),PageBreak()]

story += [Paragraph('Práctica 22',h1),Paragraph('Robot autónomo esquiva obstáculos',h2),
          callout('Reto','Construir un robot que mida la distancia frontal, se detenga ante un obstáculo, explore ambos lados y elija una maniobra segura.',TEAL),Spacer(1,.4*cm),
          Paragraph('Aprendizajes esperados',h2)] + bullets([
          'Relacionar entradas (sensor ultrasónico), procesamiento (Arduino) y salidas (servo y motores).',
          'Construir un chasis estable con materiales disponibles y cableado seguro.',
          'Programar la lógica con bloques en PictoBlox o trabajar con el código C++ generado.',
          'Calibrar distancia, velocidad y tiempos de giro mediante pruebas documentadas.']) + [Paragraph('Producto esperado',h2),Paragraph('Robot autónomo funcional o prototipo verificable, programa copiable, tabla de pruebas, video breve y página individual de Google Sites con proceso, errores, correcciones y reflexión.',body),Paragraph('Duración sugerida: 3 a 4 sesiones',h3),PageBreak()]

story += [Paragraph('El chasis: dos caminos válidos',h1),
          callout('Importante','No es necesario imprimir el chasis en 3D. La impresión 3D es una opción, no un requisito. Puede utilizarse una tabla delgada, MDF, acrílico reciclado o cartón rígido, siempre que el montaje sea estable y seguro.',ORANGE),Spacer(1,.35*cm)]
photos=[]
for n in range(3147,3153): photos.append(TMP/f'IMG_{n}.jpg')
grid=Table([[img(photos[5],7.7*cm,6.2*cm),img(photos[1],7.7*cm,6.2*cm)],
            [Paragraph('Base superior perforada: ejemplo de pieza impresa en 3D.',cap),Paragraph('Vista inferior: motores y rueda loca fijados a la base.',cap)]],colWidths=[8.1*cm,8.1*cm])
grid.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),.5,colors.HexColor('#CFD8DC')),('INNERGRID',(0,0),(-1,-1),.5,colors.HexColor('#CFD8DC')),('PADDING',(0,0),(-1,-1),6)])); story += [grid,Spacer(1,.35*cm),Paragraph('Criterios mínimos para cualquier material',h2)] + bullets(['La base no debe flexionarse hasta tocar las ruedas.','Motores, batería y tarjeta deben quedar firmemente sujetos.','No deben quedar puntas, tornillos o cables expuestos que causen cortos.','El sensor debe mirar al frente y poder girar sin rozar.']) + [PageBreak()]

story += [Paragraph('Armado real: secuencia recomendada',h1)]
seq=[(photos[0],'1. Instala motores, ruedas y rueda loca; comprueba el giro libre.'),(photos[2],'2. Fija el puente H y ordena los cables de potencia.'),(photos[3],'3. Centra el servo a 90° y monta el sensor ultrasónico.'),(photos[4],'4. Coloca Arduino o el shield en la placa superior sin forzar conexiones.')]
cells=[]
for p,c in seq: cells.append([img(p,7.5*cm,5.1*cm),Paragraph(c,cap)])
tbl=Table([[cells[0][0],cells[1][0]],[cells[0][1],cells[1][1]],[cells[2][0],cells[3][0]],[cells[2][1],cells[3][1]]],colWidths=[8.1*cm,8.1*cm])
tbl.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),.4,colors.HexColor('#CFD8DC')),('INNERGRID',(0,0),(-1,-1),.4,colors.HexColor('#CFD8DC')),('PADDING',(0,0),(-1,-1),5)])); story += [tbl,Spacer(1,.25*cm),callout('Antes de energizar','Revisa polaridad, continuidad de tierra común (GND), ausencia de cables sueltos y que ninguna rueda esté bloqueada.',ORANGE),PageBreak()]

story += [Paragraph('Conexiones de referencia',h1),Paragraph('Adapta el diagrama al modelo real de tu placa y controlador. Los pines usados por el proyecto de PictoBlox proporcionado son:',body)]
conn=[['Elemento','Conexión'],['Motor 1','Dirección: 7 y 8 | PWM: 5'],['Motor 2','Dirección: 9 y 10 | PWM: 6'],['Servomotor','Señal: pin 3'],['HC-SR04','TRIG: 12 | ECHO: 11'],['Alimentación','Fuente para motores según el controlador; GND común con Arduino']]
ct=Table([[Paragraph(str(x),body) for x in row] for row in conn],colWidths=[5*cm,11.4*cm])
ct.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),TEAL),('TEXTCOLOR',(0,0),(-1,0),colors.white),('GRID',(0,0),(-1,-1),.5,colors.HexColor('#B0BEC5')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,LIGHT]),('PADDING',(0,0),(-1,-1),8)])); story += [ct,Spacer(1,.35*cm),callout('Seguridad eléctrica','No alimentes los motores desde el pin de 5 V de Arduino. Usa la entrada de potencia del controlador y une las tierras (GND) cuando el módulo lo requiera.',ORANGE),Paragraph('Pruebas unitarias antes de integrar',h2)] + bullets(['Mide cinco distancias conocidas con el ultrasónico.','Prueba 30°, 90° y 150° del servo sin forzarlo.','Prueba cada motor por separado y corrige su sentido si es necesario.','Verifica que el robot se detenga al liberar ambos motores.']) + [PageBreak()]

story += [Paragraph('Opción 1: programación con bloques',h1),Paragraph('PictoBlox permite construir la lógica visualmente y después consultar el C++ generado. Selecciona Arduino Uno y el modo Upload. La imagen siguiente muestra el proyecto entregado.',body),img(BLOCKS,16.4*cm,9.2*cm),Spacer(1,.2*cm),Paragraph('Lectura de los bloques',h2)] + bullets(['Configura los dos motores y centra el servo en 90°.','Mide la distancia frontal con TRIG 12 y ECHO 11.','Si la distancia es mayor que 25 cm, avanza al 50%.','Si hay un obstáculo, detén los motores y mide a 150° y 30°.','Usa las mediciones laterales para ejecutar el giro programado.']) + [callout('Verificación','Durante las pruebas, comprueba que el sentido de giro corresponda con el lado que tiene mayor espacio y ajusta la polaridad o dirección de los motores si el movimiento resulta invertido.',TEAL),PageBreak()]

code1='''// This C++ code is generated by PictoBlox
#include <motor.h>
#include <Servo.h>

Motor Motor1(7, 8, 5);
Motor Motor2(9, 10, 6);
Servo Servo3;

float getDistance(int trig, int echo) {
  pinMode(trig, OUTPUT);
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);
  pinMode(echo, INPUT);
  return pulseIn(echo, HIGH) / 58.0;
}

float Distancia;
float DistanciaIzquierda;
float DistanciaDerecha;

void setup() {
  Servo3.attach(3);
  Servo3.write(90);
}'''
code2='''void loop() {
  Distancia = getDistance(12, 11);
  if (Distancia > 25) {
    Motor1.moveMotor(2.55 * 50);
    Motor2.moveMotor(2.55 * 50);
  } else {
    Motor1.freeMotor();
    Motor2.freeMotor();

    Servo3.write(150);
    delay(1000);
    DistanciaIzquierda = getDistance(12, 11);

    Servo3.write(30);
    delay(1000);
    DistanciaDerecha = getDistance(12, 11);

    Servo3.write(90);
    delay(1000);
  }
}'''
story += [Paragraph('Opción 2: código C++ generado',h1),Paragraph('Versión base proporcionada, normalizada únicamente en formato para que pueda copiarse. Conserva la lógica de PictoBlox y sus pines.',body),Table([[Preformatted(code1,code_style)]],colWidths=[16.4*cm],style=[('BACKGROUND',(0,0),(-1,-1),colors.HexColor('#F1F7F1')),('BOX',(0,0),(-1,-1),.7,GREEN),('PADDING',(0,0),(-1,-1),10)]),Spacer(1,.3*cm),callout('Biblioteca','El encabezado <font name="Courier">motor.h</font> pertenece al entorno/extensión utilizada por PictoBlox. Si se compila en otro entorno, confirma que esa biblioteca esté instalada y sea compatible.',TEAL),PageBreak(),
          Paragraph('Código C++ generado (continuación)',h1),Table([[Preformatted(code2,code_style)]],colWidths=[16.4*cm],style=[('BACKGROUND',(0,0),(-1,-1),colors.HexColor('#F1F7F1')),('BOX',(0,0),(-1,-1),.7,GREEN),('PADDING',(0,0),(-1,-1),10)]),Spacer(1,.35*cm),callout('Comportamiento del giro','El proyecto incluye la maniobra de giro. Verifica físicamente que ambos motores respondan en el sentido previsto y que el robot vuelva a medir antes de continuar.',TEAL),Paragraph('Puntos de calibración',h2)] + bullets(['Distancia mínima para detenerse sin tocar el obstáculo.','Tiempo necesario para completar el giro sobre la superficie elegida.','Velocidad que evita deslizamientos o lecturas inestables.','Tiempo de espera del servo antes de cada medición lateral.']) + [PageBreak()]

story += [Paragraph('Algoritmo completo esperado',h1),Paragraph('<b>INICIO</b><br/>1. Centrar el sensor.<br/>2. Medir la distancia frontal.<br/>3. Si es mayor que la distancia segura, avanzar.<br/>4. Si no, detenerse y medir izquierda y derecha.<br/>5. Centrar el sensor.<br/>6. Girar hacia el lado con mayor espacio.<br/>7. Si ambos lados están bloqueados, retroceder y girar.<br/>8. Repetir.',body),Paragraph('Plan obligatorio de pruebas',h2)]
tests=[['#','Escenario','Resultado esperado'],['1','Camino libre','Avanza sin oscilaciones'],['2','Obstáculo frontal','Se detiene antes del contacto'],['3','Salida por derecha','Explora y gira a la derecha'],['4','Salida por izquierda','Explora y gira a la izquierda'],['5','Callejón sin salida','Retrocede y cambia de dirección'],['6','Obstáculo angosto','Evita el contacto lateral'],['7','Lecturas inestables','Filtra o repite la medición'],['8','Batería reducida','Detecta pérdida de desempeño']]
tt=Table([[Paragraph(str(x),small) for x in r] for r in tests],colWidths=[.8*cm,5.6*cm,10*cm])
tt.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),PURPLE),('TEXTCOLOR',(0,0),(-1,0),colors.white),('GRID',(0,0),(-1,-1),.4,colors.HexColor('#B0BEC5')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,PALE]),('PADDING',(0,0),(-1,-1),6)])); story += [tt,Spacer(1,.25*cm),Paragraph('En cada prueba registra: distancia, decisión esperada, decisión observada, error, corrección y resultado final.',body),PageBreak()]

story += [Paragraph('Evidencias y evaluación',h1),Paragraph('Entregables',h2)] + bullets(['Inventario y diagrama de conexiones adaptado al equipo real.','Fotografías del proceso de construcción, incluido el material elegido para el chasis.','Programa en bloques o código C++ como texto copiable.','Tabla con ocho pruebas, errores y correcciones.','Video de 60 a 90 segundos con el robot funcionando.','Página independiente de Google Sites con proceso, evidencias y reflexión.'])
evals=[['Criterio','Valor'],['Diseño y seguridad','15%'],['Algoritmo y código','20%'],['Integración de componentes','20%'],['Funcionamiento autónomo','20%'],['Pruebas y correcciones','15%'],['Presentación y documentación','10%']]
et=Table([[Paragraph(str(x),body) for x in r] for r in evals],colWidths=[12.5*cm,3.9*cm])
et.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),TEAL),('TEXTCOLOR',(0,0),(-1,0),colors.white),('GRID',(0,0),(-1,-1),.5,colors.HexColor('#B0BEC5')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,LIGHT]),('ALIGN',(1,1),(1,-1),'CENTER'),('PADDING',(0,0),(-1,-1),7)])); story += [Spacer(1,.2*cm),et,Spacer(1,.35*cm),callout('Nombre sugerido','Práctica_22_Robot_esquiva_obstáculos_IACI',PURPLE),Paragraph('Reflexión final',h2),Paragraph('Explica cómo transformó el robot una medición en una decisión, qué calibraciones fueron necesarias, cuál fue el error más importante y qué mejora implementarías en una segunda versión.',body)]

supp=TMP/'fase5_supplement.pdf'
doc=BaseDocTemplate(str(supp),pagesize=A4,rightMargin=1.5*cm,leftMargin=1.5*cm,topMargin=1.25*cm,bottomMargin=1.5*cm)
doc.addPageTemplates(PageTemplate(id='main',frames=[Frame(doc.leftMargin,doc.bottomMargin,doc.width,doc.height,id='f')],onPage=header_footer))
doc.build(story)

# Preserve the opening/curricular pages 1-9, then replace the old index/practice section.
src=PdfReader(str(SRC)); add=PdfReader(str(supp)); writer=PdfWriter()
for p in src.pages[:9]: writer.add_page(p)
for p in add.pages: writer.add_page(p)
OUT.parent.mkdir(parents=True,exist_ok=True)
with OUT.open('wb') as f: writer.write(f)
print(OUT)
print('pages',len(writer.pages),'supplement',len(add.pages))
