import { useNavigate } from 'react-router';

import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import BiotechIcon from '@mui/icons-material/Biotech';
import WatchIcon from '@mui/icons-material/Watch';
import { Box, Button, Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { PageHeader } from '../../ui-components';

import { Footer } from './footer';
import BulletImage from './list-bulltet.svg';
import MainScreen from './main-screen.png';
import { PromoCard } from './promo-card';
import ScreenChat from './screen-chat.png';
import ScreenHealth from './screen-helath.png';
import { TextBlock, TwoColumnBlock } from './two-column-block';

const useStyles = makeStyles()((theme) => ({
  root: {
    height: '100%',
    width: '100vw',
  },
  container: {
    backgroundColor: theme.palette.common.white,
  },
  section: {
    backgroundColor: theme.palette.common.white,
  },
  sectionContent: {
    maxWidth: '70vw',
    margin: '0 auto',
    [theme.breakpoints.down('sm')]: {
      maxWidth: '100vw',
      padding: theme.spacing(0, 2),
    },
  },
  sectionWithPadding: {
    padding: theme.spacing(11, 0),
  },
  sectionDark: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.main,
  },
  about: {
    paddingTop: theme.spacing(12),
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(12),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      gap: theme.spacing(0),
      alignItems: 'center',
      paddingTop: theme.spacing(4),
    },
    '&:before': {
      position: 'absolute',
      top: 0,
      right: 0,
      zIndex: 0,
      content: "''",
      width: '45%',
      height: '60%',
      borderRadius: '0 0 0 95%',
      backgroundColor: theme.palette.primary.main,
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        backgroundColor: '#ebebf6',
        padding: theme.spacing(6, 2.5),
      },
    },
    '& > *': {
      zIndex: 1,
    },
  },
  header: {
    fontFamily: "'Montserrat', sans-serif",
  },
  cardList: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    '& > *': {
      width: 'calc(100% / 3)',
    },
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      '& > *': {
        width: '100%',
      },
    },
  },
  list: {
    padding: 0,
    listStyleType: 'none',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    '&:before': {
      content: "''",
      flexShrink: 0,
      width: 16,
      height: 16,
      background: `url(${BulletImage}) no-repeat center/cover`,
      marginRight: theme.spacing(1.5),
    },
  },
  promoRow: {
    fontSize: 15,
    marginBottom: theme.spacing(1.5),
  },
}));

export const LandingPage = () => {
  const { cx, classes } = useStyles();

  const navigate = useNavigate();

  const handleSignup = () => navigate('/signup');

  return (
    <div className={classes.root}>
      <PageHeader right={<Button onClick={handleSignup}>Зарегистрироваться</Button>} />

      <div className={classes.container}>
        <section className={classes.section}>
          <div className={cx(classes.sectionContent, classes.about)}>
            <div>
              <Box sx={{ marginBottom: 3 }}>
                <Typography className={classes.header} variant="h4">
                  MedApp
                </Typography>

                <Typography sx={{ marginTop: 1.5 }} fontWeight={400}>
                  Подробная история здоровья в одном месте
                </Typography>
              </Box>

              <ul className={classes.list}>
                <Typography component="li" className={classes.listItem}>
                  Персональные рекомендации, и безграничная забота о вас и вашей семье
                </Typography>

                <Typography component="li" className={classes.listItem}>
                  Наблюдайте за изменениями в ваших показателях здоровья и получайте рекомендаций
                </Typography>

                <Typography component="li" className={classes.listItem}>
                  Обеспечьте заботу о здоровье всей вашей семьи. Подключите систему мониторинга к родственникам и получайте
                  уведомления о возможных рисках
                </Typography>
              </ul>
            </div>

            <img src={MainScreen} alt="телефон" width="265" height="531" />
          </div>
        </section>

        <section className={cx(classes.section, classes.sectionWithPadding)}>
          <div className={classes.sectionContent}>
            <Typography sx={{ marginBottom: 3 }} className={classes.header} variant="h4">
              MedApp – это ...
            </Typography>

            <div className={classes.cardList}>
              <PromoCard
                icon={<BiotechIcon />}
                title="Рекомендации, основанные на данных"
                description={
                  <>
                    <Typography className={classes.promoRow}>
                      Получайте персональные рекомендации от квалифицированных врачей, основанные на ваших данных.
                    </Typography>

                    <Typography className={classes.promoRow}>
                      Мы предупредим вас о потенциальных рисках и поможем поддержать ваше здоровье.
                    </Typography>
                  </>
                }
              />

              <PromoCard
                icon={<AssignmentIndIcon color="primary" />}
                title="История здоровья в одном месте"
                description={
                  <>
                    <Typography className={classes.promoRow}>Вся ваша медицинская история в одном месте.</Typography>

                    <Typography className={classes.promoRow}>
                      Это облегчает вам и вашему врачу отслеживание долгосрочных изменений и трендов.
                    </Typography>
                  </>
                }
              />

              <PromoCard
                icon={<WatchIcon color="primary" style={{ height: 46, width: 46 }} />}
                title="Синхронизация с умными устройствами"
                description={
                  <>
                    <Typography className={classes.promoRow}>Оптимизируйте свой путь к заботе о здоровье!</Typography>

                    <Typography className={classes.promoRow}>
                      Автоматический мониторинг с Apple Watch и другими устройствами для максимально легкого и точного
                      отслеживания данных.
                    </Typography>
                  </>
                }
              />
            </div>
          </div>
        </section>

        <section className={cx(classes.sectionDark, classes.sectionWithPadding)}>
          <div className={classes.sectionContent}>
            <Typography fontWeight="bold" sx={{ marginBottom: 4 }} variant="h4">
              Как это работает?
            </Typography>

            <TwoColumnBlock
              index={0}
              left={<img src={MainScreen} alt="телефон" width="265" height="531" />}
              right={
                <TextBlock
                  title="Вносите данные о вашем здоровье"
                  description={
                    <Typography>
                      Вносите показатели о вашем здоровье в удобное вам время. Вы можете вносить показатели в ручном режиме, или
                      автоматически, за счет экспорта с носимых устройств.
                    </Typography>
                  }
                />
              }
            />
          </div>

          <div className={classes.sectionContent}>
            <TwoColumnBlock
              index={1}
              left={
                <TextBlock
                  title="Получайте обратную связь от врача"
                  description={
                    <Typography>
                      Ваш врач будет регулярно проверять ваши показатели и давать обратную связь и рекомендации по вашему
                      здоровью.
                    </Typography>
                  }
                />
              }
              right={<img src={ScreenHealth} alt="телефон" width="265" height="531" />}
            />
          </div>

          <div className={classes.sectionContent}>
            <TwoColumnBlock
              index={2}
              left={<img src={ScreenChat} alt="телефон" width="265" height="531" />}
              right={
                <TextBlock
                  title="Задавайте вопросы вашему врачу"
                  description={
                    <Typography>
                      Вы можете задавать интересующие вас вопросы врачу и уточнять его рекомендации. Просто напишите в чат, и ваш
                      врач обязательно вам ответит.
                    </Typography>
                  }
                />
              }
            />
          </div>
        </section>

        <div className={classes.sectionContent}>
          <Footer />
        </div>
      </div>
    </div>
  );
};
